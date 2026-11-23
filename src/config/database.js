import pg from "pg";
import "dotenv/config";
export const db = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : null;
export async function run(sql, params = []) {
  if (!db) throw new Error("DATABASE_URL no configurada");
  return db.query(sql, params);
}
