import { createClient } from "@libsql/client"
import { config } from "../config.js";
import {log} from "../utils/logger.js"
import path from "path"

const local_db_path = `file:${path.join(process.cwd(), "src", "Database", "databases.db")}`;
const turso_connect = await config.db_turso(local_db_path);

export const turso = createClient(turso_connect);   

// Inicializar la base de datos con modo WAL para mayor concurrencia
try {
    await turso.execute("PRAGMA journal_mode=WAL;");
    await turso.execute("PRAGMA synchronous=NORMAL;");
    await turso.execute("PRAGMA cache_size=-64000;");   // 64MB cache
    await turso.execute("PRAGMA temp_store=MEMORY;");  // temp en RAM
    await turso.execute("PRAGMA mmap_size=268435456;"); // 256MB mmap
} catch (err) {
    log.error("Error al configurar base de datos:", err);
}