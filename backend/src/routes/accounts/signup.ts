import { pool } from "../../setup/pool.js";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const obfuscatedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO accounts (email, password_hash, name)
       VALUES ($1, $2, $3)`,
      [email, obfuscatedPassword, name],
    );

    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
    console.error(error);
  }
});

export default router;
