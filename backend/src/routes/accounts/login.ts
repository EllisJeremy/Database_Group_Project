import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../setup/env.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { UserType } from "../../types/express.js";

const router = Router();

router.post("", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const {
      rows: [account],
    } = await pool.query(
      `
      SELECT id, email, password_hash, name
      FROM accounts
      WHERE email = $1
      `,
      [email],
    );

    const backUpHash = "$2b$10$stn5DE/DAtvWOGMw4xywfuauxmtsbD7wyXP9/1oEitpFbGinvalid";

    const hash = account?.password_hash ?? backUpHash;
    const valid = await bcrypt.compare(password, hash);

    if (!account || !valid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const user: UserType = {
      id: account.id,
      email: account.email,
      name: account.name,
    };

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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// this is the res when a user has the cookie in their browser after refresh
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
