import { createClient } from "@libsql/client"
import { config } from "../config.js";
import path from "path"

const { db_turso } = config;
const localRootDb = path.join("file:", process.cwd(), "src", "Database", "databases.db")
const turso_connect = await config.db_turso(localRootDb);

// Add a check to ensure url is defined
if (!turso_connect.url) {
  throw new Error("Database URL is not configured");
}

export const turso = createClient(turso_connect);