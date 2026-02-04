import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";

import health from "./routes/health.js";
import accounts from "./routes/accounts/accountsIndex.js";
import skills from "./routes/skills/skills.js";
import classes from "./routes/classes/classes.js";
import posts from "./routes/posts/posts.js";

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/accounts", accounts);
app.use("/health", health);
app.use("/skills", skills);
app.use("/classes", classes);
app.use("/posts", posts);

app.listen(port);
