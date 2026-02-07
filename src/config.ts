
import dotenv from "dotenv";
import { ConfigCookiesParams } from "./models/types.js"
dotenv.config();

const { NODE_ENV, JWT_SECRET, DB_TURSO_URL, DB_TURSO_AUTH_TOKEN, PORT, DOMAIN_FOR_FRONTEND, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, HTTP_ONLY, SECURE, SAME_SITE, MAX_AGE, PATH } = process.env;
const OPTION_JWT_SECRET = '7561184b9ed5ea12124beda9e5e77bc373eb01ea6d381f43cb83a8c9088138b249507d021281bd5ea410dbb5b803fd9f219eda9f5175b68029cf93cae9ee41b3'
export const config = {
    port: PORT || 3000,
    baseUrl: DOMAIN_FOR_FRONTEND || "http://localhost:3000",
    jwtSecret: JWT_SECRET || OPTION_JWT_SECRET,
    nodeEnv: NODE_ENV,
    configCookiesParams: {
        httpOnly: HTTP_ONLY || true,
        secure: SECURE || false,
        sameSite: SAME_SITE || false,
        maxAge: MAX_AGE || (2 * 24 * 60 * 60 * 1000),
        path: PATH || '/'
    } as ConfigCookiesParams,
    configSendEmail: ({
        emailUser: EMAIL_USER || '',
        emailPass: EMAIL_PASS || '',
        emailHost: EMAIL_HOST || '',
        emailPort: EMAIL_PORT || '',
        emailSecure: EMAIL_SECURE || '',
    }),
    db_turso: async (local_file_path?: string, auth_token?: string) => {
        return {
            url: NODE_ENV !== 'Production' ? local_file_path : DB_TURSO_URL,
            authToken: NODE_ENV !== 'Production' ? auth_token : DB_TURSO_AUTH_TOKEN
        }
    }
}; 