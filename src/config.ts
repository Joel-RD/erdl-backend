
import dotenv from "dotenv";
import { ConfigCookiesParams } from "./models/types.js"

dotenv.config();

const { NODE_ENV, JWT_SECRET, DB_TURSO_URL, DB_TURSO_AUTH_TOKEN, PORT, DOMAIN_FOR_FRONTEND, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, HTTP_ONLY, SECURE, SAME_SITE, MAX_AGE, PATH, EAMIL_VALID_JWT_SECRE } = process.env;

export const config = {
    port: PORT || 3000,
    baseUrl: DOMAIN_FOR_FRONTEND || "http://localhost:3000",
    jwtSecret: JWT_SECRET || "default_secret_key_for_development_only",
    nodeEnv: NODE_ENV,
    configCookiesParams: {
        httpOnly: HTTP_ONLY || true,
        secure: SECURE || false,
        sameSite: SAME_SITE || "lax",
        maxAge: Number(MAX_AGE) || (2 * 24 * 60 * 60 * 1000),
        path: PATH || "/"
    } as ConfigCookiesParams,
    configSendEmail: ({
        emailUser: EMAIL_USER || '',
        emailPass: EMAIL_PASS || '',
        emailHost: EMAIL_HOST || '',
        emailPort: EMAIL_PORT || '',
        emailSecure: EMAIL_SECURE || '',
    }),
    db_turso: async (local_file_path?: string) => {
        const isProduction = NODE_ENV?.toLowerCase() === 'production';
        if (!isProduction) {
            return {
                url: local_file_path,
            }
        }
        return {
            url: DB_TURSO_URL,
            authToken: DB_TURSO_AUTH_TOKEN
        }
    }
}; 