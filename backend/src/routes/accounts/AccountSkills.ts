import { Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { pool } from "../../setup/pool";
import format from "pg-format";

const router = Router();

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  const id = req.user.id;
  const { skills } = req.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400).json({ error: "Skills must be a non-empty array" });
    return;
  }

  const values = skills.map((skill: number) => [id, skill]);

  try {
    await pool.query(format("INSERT INTO account_skills (account_id, skill_id) VALUES %L", values));
    res.json({ success: true });
  } catch (e: any) {
    console.error("cant add skill", e);

    if (e.code === "23503") {
      res.status(400).json({ error: "Invalid skill ID" });
      return;
    }

    res.status(500).json({ error: "Failed to add skills" });
  }
});

router.post("/remove", requireAuth, async (req: Request, res: Response) => {
  const id = req.user.id;
  const { skills } = req.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400).json({ error: "Skills must be a non-empty array" });
    return;
  }

  try {
    await pool.query("DELETE FROM account_skills WHERE account_id = $1 AND skill_id = ANY($2)", [
      id,
      skills,
    ]);
    res.json({ success: true });
  } catch (e) {
    console.error("cant remove skill", e);
    res.status(500).json({ error: "Failed to remove skills" });
  }
});

export default router;
