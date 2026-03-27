import { pool } from "../../setup/pool.js";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../setup/env.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const obfuscatedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO accounts (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, is_admin AS isAdmin`,
      [email, obfuscatedPassword, name],
    );
    const user = rows[0];

    const token = jwt.sign(user, env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      success: true,
      user,
    });
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
