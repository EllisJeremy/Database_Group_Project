import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

router.get("", async (req: Request, res: Response) => {
  const { class_id } = req.query;

  try {
    let query = `
      SELECT
        p.*,
        a.name as author_name,
        c.name as class_name,
        c.section as class_section,
        g.id as group_id,
        g.group_name,
        g.max_members as group_max_members,
        g.created_by as group_created_by
      FROM posts p
      JOIN accounts a ON p.author_id = a.id
      JOIN classes c ON p.class_id = c.id
      LEFT JOIN groups g ON p.group_id = g.id
    `;

    const params: any[] = [];

    if (class_id) {
      query += ` WHERE p.class_id = $1`;
      params.push(class_id);
    }

    query += ` ORDER BY p.created_at DESC`;

    const { rows: posts } = await pool.query(query, params);

    // Fetch members for any linked groups
    const groupIds = posts.filter((p: any) => p.group_id).map((p: any) => p.group_id);

    const membersByGroup: Record<number, any[]> = {};
    if (groupIds.length > 0) {
      const { rows: members } = await pool.query(
        `SELECT ag.group_id, ag.account_id, a.name
         FROM account_groups ag
         JOIN accounts a ON ag.account_id = a.id
         WHERE ag.group_id = ANY($1)`,
        [groupIds],
      );
      for (const member of members) {
        if (!membersByGroup[member.group_id]) membersByGroup[member.group_id] = [];
        membersByGroup[member.group_id].push({ account_id: member.account_id, name: member.name });
      }
    }

    // Shape group info into a nested object
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

router.post("/add", requireAuth, async (req: Request, res: Response) => {
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
        await client.query(
          `INSERT INTO account_groups (account_id, group_id) VALUES ($1, $2)`,
          [authorId, groupId],
        );
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

router.put("/update/:id", requireAuth, async (req: Request, res: Response) => {
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

router.delete("/delete/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  try {
    const postCheck = await pool.query(`SELECT author_id, group_id FROM posts WHERE id = $1`, [postId]);

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

export default router;
