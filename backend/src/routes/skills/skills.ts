import { Request, Response, Router } from "express";
import { pool } from "../../setup/pool";

const router = Router();

router.post("/add", async (req: Request, res: Response) => {
  const { name, type } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO skills (name, type)
       VALUES ($1, $2)
       RETURNING *`,
      [name, type],
    );

    res.json({
      success: true,
      skill: rows[0],
    });
  } catch (e: any) {
    console.error("Failed to add skill:", e);

    if (e.code === "23505") {
      res.status(409).json({ error: "Skill already exists" });
      return;
    }

    if (e.code === "22P02") {
      res.status(400).json({ error: "Invalid skill type" });
      return;
    }

    res.status(500).json({ error: "Failed to add skill" });
  }
});

router.get("", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM skills`);
    res.json({ success: true, skills: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get skills" });
  }
});

export default router;
