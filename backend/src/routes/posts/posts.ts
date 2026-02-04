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
        c.section as class_section
      FROM posts p
      JOIN accounts a ON p.author_id = a.id
      JOIN classes c ON p.class_id = c.id
    `;

    const params: any[] = [];

    if (class_id) {
      query += ` WHERE p.class_id = $1`;
      params.push(class_id);
    }

    query += ` ORDER BY p.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json({ success: true, posts: rows });
  } catch (error) {
    console.error("Failed to get posts:", error);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  const authorId = req.user.id;
  const { class_id, title, description, total_slots, filled_slots } = req.body;

  try {
    const classCheck = await pool.query(`SELECT id FROM classes WHERE id = $1`, [class_id]);

    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO posts (class_id, author_id, title, description, total_slots, filled_slots)
       VALUES ($1, $2, $3, $4, $5, )
       RETURNING *`,
      [class_id, authorId, title, description, total_slots, filled_slots],
    );

    res.json({
      success: true,
      post: result.rows[0],
    });
  } catch (error: any) {
    console.error("Failed to create post:", error);

    if (error.code === "23503") {
      res.status(400).json({ error: "Invalid class_id" });
      return;
    }

    res.status(500).json({ error: "Failed to create post" });
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
    const postCheck = await pool.query(`SELECT author_id FROM posts WHERE id = $1`, [postId]);

    if (postCheck.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (postCheck.rows[0].author_id !== userId) {
      res.status(403).json({ error: "You can only delete your own posts" });
      return;
    }

    await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
