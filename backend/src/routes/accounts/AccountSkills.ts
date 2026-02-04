import { Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { pool } from "../../setup/pool";
import format from "pg-format";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const id = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.type
    FROM account_skills a_s
    JOIN skills s
    ON a_s.skill_id = s.id
    WHERE a_s.account_id = $1`,
      [id],
    );

    res.json({ success: true, skills: rows });
  } catch (error) {}
});

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  const id = req.user.id;
  const { skillIds } = req.body;

  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    res
      .status(400)
      .json({ error: "Skills must be a non-empty array. What you passed: skillIds:", skillIds });
    return;
  }

  const values = skillIds.map((skill: number) => [id, skill]);

  try {
    await pool.query(format("INSERT INTO account_skills (account_id, skill_id) VALUES %L", values));
    res.json({ success: true });
  } catch (e: any) {
    console.error("cant add skill", e);

    if (e.code === "23503") {
      res.status(400).json({ error: "Invalid skill ID" });
      return;
    }

    res.status(500).json({ error: "Failed to add skillIds" });
  }
});

router.post("/delete", requireAuth, async (req: Request, res: Response) => {
  const id = req.user.id;
  const { skillIds } = req.body;

  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    res.status(400).json({ error: "Skills must be a non-empty array" });
    return;
  }

  try {
    await pool.query("DELETE FROM account_skills WHERE account_id = $1 AND skill_id = ANY($2)", [
      id,
      skillIds,
    ]);
    res.json({ success: true });
  } catch (e) {
    console.error("cant delete skill", e);
    res.status(500).json({ error: "Failed to delete skillIds" });
  }
});

export default router;
