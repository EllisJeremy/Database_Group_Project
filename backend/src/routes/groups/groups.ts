import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

router.get("", async (req: Request, res: Response) => {
  const { class_id } = req.query;

  try {
    let query = `
      SELECT
        g.id,
        g.group_name,
        g.max_members,
        g.created_by,
        g.created_at,
        g.class_id,
        c.name as class_name,
        c.section as class_section,
        a.name as creator_name,
        COUNT(ag.account_id)::int as member_count
      FROM groups g
      JOIN classes c ON g.class_id = c.id
      JOIN accounts a ON g.created_by = a.id
      LEFT JOIN account_groups ag ON g.id = ag.group_id
    `;

    const params: any[] = [];

    if (class_id) {
      query += ` WHERE g.class_id = $1`;
      params.push(class_id);
    }

    query += ` GROUP BY g.id, c.name, c.section, a.name ORDER BY g.created_at DESC`;

    const { rows: groups } = await pool.query(query, params);

    // Fetch members for each group
    const groupIds = groups.map((g: any) => g.id);

    if (groupIds.length > 0) {
      const { rows: members } = await pool.query(
        `SELECT ag.group_id, ag.account_id, a.name
         FROM account_groups ag
         JOIN accounts a ON ag.account_id = a.id
         WHERE ag.group_id = ANY($1)`,
        [groupIds],
      );

      const membersByGroup: Record<number, any[]> = {};
      for (const member of members) {
        if (!membersByGroup[member.group_id]) {
          membersByGroup[member.group_id] = [];
        }
        membersByGroup[member.group_id].push({
          account_id: member.account_id,
          name: member.name,
        });
      }

      for (const group of groups) {
        group.members = membersByGroup[group.id] || [];
      }
    } else {
      for (const group of groups) {
        group.members = [];
      }
    }

    res.json({ success: true, groups });
  } catch (error) {
    console.error("Failed to get groups:", error);
    res.status(500).json({ error: "Failed to get groups" });
  }
});

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  const creatorId = req.user.id;
  const { class_id, group_name, max_members } = req.body;

  try {
    const classCheck = await pool.query(`SELECT id FROM classes WHERE id = $1`, [class_id]);

    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO groups (class_id, group_name, max_members, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [class_id, group_name, max_members, creatorId],
      );

      const group = result.rows[0];

      // Auto-join the creator to the group
      await client.query(
        `INSERT INTO account_groups (account_id, group_id)
         VALUES ($1, $2)`,
        [creatorId, group.id],
      );

      await client.query("COMMIT");

      res.json({ success: true, group });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Failed to create group:", error);

    if (error.code === "23503") {
      res.status(400).json({ error: "Invalid class_id" });
      return;
    }

    res.status(500).json({ error: "Failed to create group" });
  }
});

router.put("/update/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const groupId = parseInt(req.params.id);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }

  const { group_name, max_members } = req.body;

  if (!group_name && max_members === undefined) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  try {
    const groupCheck = await pool.query(`SELECT created_by FROM groups WHERE id = $1`, [groupId]);

    if (groupCheck.rows.length === 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    if (groupCheck.rows[0].created_by !== userId) {
      res.status(403).json({ error: "You can only update your own groups" });
      return;
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (group_name) {
      fields.push(`group_name = $${paramIndex++}`);
      params.push(group_name);
    }

    if (max_members !== undefined) {
      fields.push(`max_members = $${paramIndex++}`);
      params.push(max_members);
    }

    params.push(groupId);

    const result = await pool.query(
      `UPDATE groups SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params,
    );

    res.json({ success: true, group: result.rows[0] });
  } catch (error) {
    console.error("Failed to update group:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
});

router.delete("/delete/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const groupId = parseInt(req.params.id);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }

  try {
    const groupCheck = await pool.query(`SELECT created_by FROM groups WHERE id = $1`, [groupId]);

    if (groupCheck.rows.length === 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    if (groupCheck.rows[0].created_by !== userId) {
      res.status(403).json({ error: "You can only delete your own groups" });
      return;
    }

    await pool.query(`DELETE FROM groups WHERE id = $1`, [groupId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete group:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

router.post("/:id/join", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const groupId = parseInt(req.params.id);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }

  try {
    const groupCheck = await pool.query(
      `SELECT g.max_members, COUNT(ag.account_id)::int as member_count
       FROM groups g
       LEFT JOIN account_groups ag ON g.id = ag.group_id
       WHERE g.id = $1
       GROUP BY g.id`,
      [groupId],
    );

    if (groupCheck.rows.length === 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const { max_members, member_count } = groupCheck.rows[0];

    if (member_count >= max_members) {
      res.status(400).json({ error: "Group is full" });
      return;
    }

    // Check if already a member
    const memberCheck = await pool.query(
      `SELECT account_id FROM account_groups WHERE account_id = $1 AND group_id = $2`,
      [userId, groupId],
    );

    if (memberCheck.rows.length > 0) {
      res.status(400).json({ error: "You are already a member of this group" });
      return;
    }

    await pool.query(
      `INSERT INTO account_groups (account_id, group_id) VALUES ($1, $2)`,
      [userId, groupId],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to join group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

router.post("/:id/leave", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const groupId = parseInt(req.params.id);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group ID" });
    return;
  }

  try {
    const groupCheck = await pool.query(`SELECT created_by FROM groups WHERE id = $1`, [groupId]);

    if (groupCheck.rows.length === 0) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

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

    await pool.query(
      `DELETE FROM account_groups WHERE account_id = $1 AND group_id = $2`,
      [userId, groupId],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to leave group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

export default router;
