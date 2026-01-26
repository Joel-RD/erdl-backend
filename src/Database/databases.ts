import Databases, { Database as DB } from "better-sqlite3"
import path from "path"

export const connectionDB = new Databases(path.join(process.cwd(), "src", "Database", "databases.db"));