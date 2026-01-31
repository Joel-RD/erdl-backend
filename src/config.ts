
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const OPTION_JWT_SECRET = '7561184b9ed5ea12124beda9e5e77bc373eb01ea6d381f43cb83a8c9088138b249507d021281bd5ea410dbb5b803fd9f219eda9f5175b68029cf93cae9ee41b3'

export const config = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.DOMAIN_FOR_FRONTEND || "http://localhost:3000",
    jwtSecret: process.env.JWT_SECRET || OPTION_JWT_SECRET,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    emailHost: process.env.EMAIL_HOST,
    emailPort: process.env.EMAIL_PORT,
    emailSecure: process.env.EMAIL_SECURE,
    db_turso: async (local_file_path?: string, auth_token?: string) => {
        return {
            url: process.env.DB_TURSO_URL || local_file_path,
            authToken: process.env.DB_TURSO_AUTH_TOKEN || auth_token
        }
    }
};