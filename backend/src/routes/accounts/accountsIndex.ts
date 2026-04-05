import { Router } from "express";

import signup from "./signup.js";
import login from "./login.js";
import logout from "./logout.js";
import skills from "./AccountSkills.js";
import forgotPassword from "./forgotPassword.js";
import resetPassword from "./resetPassword.js";

const router = Router();
router.use("/signup", signup);
router.use("/login", login);
router.use("/logout", logout);
router.use("/skills", skills);
router.use("/forgot-password", forgotPassword);
router.use("/reset-password", resetPassword);

export default router;
