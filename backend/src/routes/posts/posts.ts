import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("", async (req: Request, res: Response) => {
  const { class_id } = req.query;
  const userId = req.user.id;

  try {
    const params: any[] = [userId];
    const query = `
        WITH user_skills AS (
          SELECT skill_id FROM account_skills WHERE account_id = $1
        )
        SELECT
          p.*,
          a.name as author_name,
          c.name as class_name,
          c.section as class_section,
          g.id as group_id,
          g.group_name,
          g.max_members as group_max_members,
          g.created_by as group_created_by,
          COALESCE((
            SELECT COUNT(*)::int
            FROM account_groups ag2
            JOIN account_skills ags2 ON ag2.account_id = ags2.account_id
            JOIN user_skills us ON ags2.skill_id = us.skill_id
            WHERE ag2.group_id = g.id
            AND ag2.account_id != $1
          ), 0) as skill_match_score
        FROM posts p
        JOIN accounts a ON p.author_id = a.id
        JOIN classes c ON p.class_id = c.id
        LEFT JOIN groups g ON p.group_id = g.id
        ${class_id ? "WHERE p.class_id = $2" : ""}
        ORDER BY skill_match_score DESC, p.created_at DESC
      `;
    if (class_id) params.push(class_id);

    const { rows: posts } = await pool.query(query, params);

    const groupIds = posts.filter((p: any) => p.group_id).map((p: any) => p.group_id);

    const membersByGroup: Record<number, any[]> = {};
    if (groupIds.length > 0) {
      const { rows: members } = await pool.query(
        `SELECT ag.group_id, ag.account_id, a.name,
          COALESCE(
            json_agg(
              json_build_object('id', s.id, 'name', s.name, 'type', s.type)
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'::json
          ) as skills
         FROM account_groups ag
         JOIN accounts a ON ag.account_id = a.id
         LEFT JOIN account_skills aks ON ag.account_id = aks.account_id
         LEFT JOIN skills s ON aks.skill_id = s.id
         WHERE ag.group_id = ANY($1)
         GROUP BY ag.group_id, ag.account_id, a.name`,
        [groupIds],
      );
      for (const member of members) {
        if (!membersByGroup[member.group_id]) membersByGroup[member.group_id] = [];
        membersByGroup[member.group_id].push({
          account_id: member.account_id,
          name: member.name,
          skills: member.skills,
        });
      }
    }

    for (const post of posts) {
      if (post.group_id) {
        post.group = {
          id: post.group_id,
          group_name: post.group_name,
          max_members: post.group_max_members,
          created_by: post.group_created_by,
          members: membersByGroup[post.group_id] || [],
        };
      } else {
        post.group = null;
      }
      delete post.group_name;
      delete post.group_max_members;
      delete post.group_created_by;
    }

    res.json({ success: true, posts });
  } catch (error) {
    console.error("Failed to get posts:", error);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.post("/add", async (req: Request, res: Response) => {
  const authorId = req.user.id;
  const { class_id, title, description, group_name, max_members } = req.body;

  try {
    const classCheck = await pool.query(`SELECT id FROM classes WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let groupId: number | null = null;

      if (group_name) {
        const groupResult = await client.query(
          `INSERT INTO groups (class_id, group_name, max_members, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [class_id, group_name, max_members || 4, authorId],
        );
        groupId = groupResult.rows[0].id;

        // Auto-join the creator
        await client.query(`INSERT INTO account_groups (account_id, group_id) VALUES ($1, $2)`, [
          authorId,
          groupId,
        ]);
      }

      const result = await client.query(
        `INSERT INTO posts (class_id, author_id, title, description, group_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [class_id, authorId, title, description, groupId],
      );

      await client.query("COMMIT");
      res.json({ success: true, post: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Failed to create post:", error);
    if (error.code === "23503") {
      res.status(400).json({ error: "Invalid class_id" });
      return;
    }
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/update/:id", async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const { title, description } = req.body;

  if (!title && !description) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  try {
    const postCheck = await pool.query(`SELECT author_id FROM posts WHERE id = $1`, [postId]);

    if (postCheck.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (postCheck.rows[0].author_id !== userId) {
      res.status(403).json({ error: "You can only update your own posts" });
      return;
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (title) {
      fields.push(`title = $${paramIndex++}`);
      params.push(title);
    }

    if (description) {
      fields.push(`description = $${paramIndex++}`);
      params.push(description);
    }

    params.push(postId);

    const result = await pool.query(
      `UPDATE posts SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params,
    );

    res.json({ success: true, post: result.rows[0] });
  } catch (error) {
    console.error("Failed to update post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  try {
    const postCheck = await pool.query(`SELECT author_id, group_id FROM posts WHERE id = $1`, [
      postId,
    ]);

    if (postCheck.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (postCheck.rows[0].author_id !== userId) {
      res.status(403).json({ error: "You can only delete your own posts" });
      return;
    }

    const groupId = postCheck.rows[0].group_id;

    await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    // Delete the linked group (the post was its ad)
    if (groupId) {
      await pool.query(`DELETE FROM groups WHERE id = $1`, [groupId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.post("/:id/join", async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  try {
    const postCheck = await pool.query(`SELECT group_id FROM posts WHERE id = $1`, [postId]);

    if (postCheck.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const groupId = postCheck.rows[0].group_id;

    if (!groupId) {
      res.status(400).json({ error: "This post has no associated group" });
      return;
    }

    const groupCheck = await pool.query(
      `SELECT g.max_members, COUNT(ag.account_id)::int as member_count
       FROM groups g
       LEFT JOIN account_groups ag ON g.id = ag.group_id
       WHERE g.id = $1
       GROUP BY g.id`,
      [groupId],
    );

    const { max_members, member_count } = groupCheck.rows[0];

    if (member_count >= max_members) {
      res.status(400).json({ error: "Group is full" });
      return;
    }

    const memberCheck = await pool.query(
      `SELECT account_id FROM account_groups WHERE account_id = $1 AND group_id = $2`,
      [userId, groupId],
    );

    if (memberCheck.rows.length > 0) {
      res.status(400).json({ error: "You are already a member of this group" });
      return;
    }

    await pool.query(`INSERT INTO account_groups (account_id, group_id) VALUES ($1, $2)`, [
      userId,
      groupId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to join group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

router.post("/:id/leave", async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  try {
    const postCheck = await pool.query(`SELECT group_id FROM posts WHERE id = $1`, [postId]);

    if (postCheck.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const groupId = postCheck.rows[0].group_id;

    if (!groupId) {
      res.status(400).json({ error: "This post has no associated group" });
      return;
    }

    const groupCheck = await pool.query(`SELECT created_by FROM groups WHERE id = $1`, [groupId]);

    if (groupCheck.rows[0].created_by === userId) {
      res.status(400).json({ error: "The creator cannot leave the group" });
      return;
    }

    const memberCheck = await pool.query(
      `SELECT account_id FROM account_groups WHERE account_id = $1 AND group_id = $2`,
      [userId, groupId],
    );

    if (memberCheck.rows.length === 0) {
      res.status(400).json({ error: "You are not a member of this group" });
      return;
    }

    await pool.query(`DELETE FROM account_groups WHERE account_id = $1 AND group_id = $2`, [
      userId,
      groupId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to leave group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

export default router;
