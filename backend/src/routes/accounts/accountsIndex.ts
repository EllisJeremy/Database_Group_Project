import { Router } from "express";

import signup from "./signup.js";
import login from "./login.js";
import logout from "./logout.js";
import skills from "./AccountSkills.js";

const router = Router();
router.use("/signup", signup);
router.use("/login", login);
router.use("/logout", logout);
router.use("/skills", skills);

export default router;
