import { createClient } from "@libsql/client"
import { config } from "../config.js";
import path from "path"

const { DB_CONNECT, isProduction } = config;
const local_db_path = `file:${path.join(process.cwd(), "src", "Database", "databases.db")}`;

let url: string;
let authToken: string | undefined;

if (!isProduction) {
    url = local_db_path;
} else {
    const dbConfig = await DB_CONNECT();
    if (!dbConfig.url) {
        throw new Error("Database URL is not configured");
    }
    url = dbConfig.url;
    authToken = dbConfig.authToken;
}

export const turso = createClient({ url, authToken });