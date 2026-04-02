import { pool } from "./setup/pool";
import bcrypt from "bcrypt";

export default async function seed() {
  const password = "example";
  const email = "example@example.com";
  const name = "example";
  const obfuscatedPassword = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO accounts (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, is_admin AS isAdmin`,
    [email, obfuscatedPassword, name],
  );
}
