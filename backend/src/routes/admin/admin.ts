import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, name, is_admin, created_at
      FROM accounts
      ORDER BY created_at DESC
    `);
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.put("/users/:id/make-admin", async (req: Request, res: Response) => {
  const targetId = parseInt(req.params.id);

  if (isNaN(targetId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE accounts SET is_admin = true WHERE id = $1 RETURNING id, email, name, is_admin`,
      [targetId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to promote user" });
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  const targetId = parseInt(req.params.id);

  if (isNaN(targetId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const result = await pool.query(
      `DELETE FROM accounts WHERE id = $1 RETURNING id`,
      [targetId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
