import { pool } from "./setup/pool";
import bcrypt from "bcrypt";
import { env } from "./setup/env";

export default async function seed() {
  const password = env.ADMIN_PASSWORD;
  const email = "jeremyellis@vt.edu";
  const name = "admin";
  const isAdmin = true;
  const obfuscatedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO accounts (email, password_hash, name, is_admin)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [email, obfuscatedPassword, name, isAdmin],
  );
}
