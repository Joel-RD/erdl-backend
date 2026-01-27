
import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.DOMAIN_FOR_FRONTEND || "http://localhost:3000",
    db_turso: async (local_file_path?: string, auth_token?: string) => {
        return {
            url: process.env.DB_TURSO_URL || local_file_path,
            authToken: process.env.DB_TURSO_AUTH_TOKEN || auth_token
        }
    }
};