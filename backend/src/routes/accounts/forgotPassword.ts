import { Request, Response, Router } from "express";
import crypto from "crypto";
import { pool } from "../../setup/pool.js";
import { sendEmail } from "../../email/sendEmail.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const { rows } = await pool.query(`SELECT id FROM accounts WHERE email = $1`, [email]);

    // Always return 200 to avoid leaking whether the email exists
    if (!rows[0]) {
      res.json({ success: true });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(
      `INSERT INTO password_reset_tokens (token, account_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [token, rows[0].id],
    );

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Reset your password",
      `Click the link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 1 hour.</p>`,
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
