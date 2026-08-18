
import dotenv from "dotenv";
import { ConfigCookiesParams } from "./models/types.js"
import logger from "./utils/logger.js";

dotenv.config();

const { NODE_ENV, JWT_SECRET, DB_TURSO_URL, DB_TURSO_AUTH_TOKEN, PORT, DOMAIN_FOR_FRONTEND, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, HTTP_ONLY, SECURE, SAME_SITE, MAX_AGE, COOKIE_PATH } = process.env;

const isProduction = NODE_ENV === "production";

export const config = {
    port: PORT || 3000,
    isProduction: isProduction,
    baseUrl: DOMAIN_FOR_FRONTEND || "http://localhost:3000",
    jwtSecret: (() => {
        if (!JWT_SECRET) {
            if (NODE_ENV === 'production') {
                throw new Error('JWT_SECRET is required in production');
            }
            logger.warn('WARNING: Using development JWT secret - DO NOT USE IN PRODUCTION');
            return 'dev_only_secret_' + Math.random().toString(36);
        }
        return JWT_SECRET;
    })(),
    nodeEnv: NODE_ENV,
    configCookiesParams: {
        httpOnly: HTTP_ONLY !== "false",
        secure: isProduction,
        sameSite: SAME_SITE || "lax",
        maxAge: Number(MAX_AGE) || ( 7 * 24 * 60 * 60 * 1000),
        path: COOKIE_PATH || "/"
    } as ConfigCookiesParams,
    configSendEmail: ({
        emailUser: EMAIL_USER || '',
        emailPass: EMAIL_PASS || '',
        emailHost: EMAIL_HOST || '',
        emailPort: EMAIL_PORT || '',
        emailSecure: EMAIL_SECURE || '',
    }),
    DB_CONNECT: () => ({
        url: DB_TURSO_URL,
        authToken: DB_TURSO_AUTH_TOKEN
    })
};