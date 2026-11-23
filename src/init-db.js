import "dotenv/config";
import pg from "pg";
import fs from "node:fs";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
await db.query(
  fs.readFileSync(new URL("../schema.sql", import.meta.url), "utf8"),
);
await db.end();
console.log("Esquema inicializado");
