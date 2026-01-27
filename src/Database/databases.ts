import { createClient } from "@libsql/client"
import { config } from "../config";
import path from "path"

const { db_turso } = config;
const turso_connect = await config.db_turso(path.join("file:", process.cwd(), "src", "Database", "databases.db"));
export const turso = createClient(turso_connect);   