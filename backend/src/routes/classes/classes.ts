import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

// Get all classes
router.get("", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.*,
        a.name as creator_name,
        COUNT(p.id)::int as post_count
      FROM classes c
      JOIN accounts a ON c.creator_id = a.id
      LEFT JOIN posts p ON p.class_id = c.id
      GROUP BY c.id, a.name
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, classes: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get classes" });
  }
});

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  const creatorId = req.user.id;
  const { name, section } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO classes (name, section, creator_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, section, creatorId],
    );

    res.json({
      success: true,
      class: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to add class:", error);
    res.status(500).json({ error: "Failed to add class" });
  }
});

router.put("/update/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const classId = parseInt(req.params.id);

  if (isNaN(classId)) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  const { name, section } = req.body;

  if (!name && !section) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  try {
    const classCheck = await pool.query(`SELECT creator_id FROM classes WHERE id = $1`, [classId]);

    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    if (classCheck.rows[0].creator_id !== userId) {
      res.status(403).json({ error: "You can only update your own classes" });
      return;
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name) {
      fields.push(`name = $${paramIndex++}`);
      params.push(name);
    }

    if (section) {
      fields.push(`section = $${paramIndex++}`);
      params.push(section);
    }

    params.push(classId);

    const result = await pool.query(
      `UPDATE classes SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params,
    );

    res.json({ success: true, class: result.rows[0] });
  } catch (error) {
    console.error("Failed to update class:", error);
    res.status(500).json({ error: "Failed to update class" });
  }
});

router.delete("/delete/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const classId = parseInt(req.params.id);

  if (isNaN(classId)) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  try {
    const classCheck = await pool.query(`SELECT creator_id FROM classes WHERE id = $1`, [classId]);

    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    if (classCheck.rows[0].creator_id !== userId) {
      res.status(403).json({ error: "You can only delete your own classes" });
      return;
    }

    await pool.query(`DELETE FROM classes WHERE id = $1`, [classId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete class:", error);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

export default router;
