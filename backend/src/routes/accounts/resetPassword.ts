import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../../setup/pool.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const { rows } = await pool.query(
      `DELETE FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW()
       RETURNING account_id`,
      [token],
    );

    if (!rows[0]) {
      res.status(400).json({ success: false, error: "Invalid or expired token" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(`UPDATE accounts SET password_hash = $1 WHERE id = $2`, [
      hash,
      rows[0].account_id,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
