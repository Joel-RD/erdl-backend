import { createClient } from "@libsql/client"
import { config } from "../config.js";
import path from "path"

const { db_turso } = config;
const local_db_path = path.join("file:", process.cwd(), "src", "Database", "databases.db");
const turso_connect = await config.db_turso(local_db_path);

export const turso = createClient(turso_connect);   
