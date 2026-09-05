import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import {config} from "../config.js"
import { Request, Response } from 'express'
import { AppError } from "./AppError.js";
import { buildErrorBody } from "./responseFormat.js";

const {nodeEnv} = config;
const isStressTest = process.env.STRESS_TEST === 'true';

function rateLimitErrorHandler(message: string) {
    return (req: Request, res: Response) => {
        const error = new AppError(429, message, undefined, "RATE_LIMITED");
        return res.status(error.statusCode).json(buildErrorBody(error));
    };
}

// Rate limit para la creación de URLs (POST /api/v1/short)
export const shortenRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: isStressTest ? 10000000 : (nodeEnv !== "production" ? 1000000 : 5000),
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isStressTest,
    message: "Has alcanzado el límite de generación de URLs. Por favor, inténtalo de nuevo en una hora.",
    handler: rateLimitErrorHandler("Has alcanzado el límite de generación de URLs. Por favor, inténtalo de nuevo en una hora."),
    keyGenerator: (req: Request): string => {
        return ipKeyGenerator(req.ip || '');
    }
});

// Rate limit para las redirecciones (GET /:shortUrl)
export const redirectRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: isStressTest ? 10000000 : (nodeEnv !== "production" ? 1000000 : 50000),
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isStressTest,
    message: "Has alcanzado el límite de redirecciones. Por favor, inténtalo de nuevo en una hora.",
    handler: rateLimitErrorHandler("Has alcanzado el límite de redirecciones. Por favor, inténtalo de nuevo en una hora."),
    keyGenerator: (req: Request): string => {
        return ipKeyGenerator(req.ip || '');
    }
});

// Alias para mantener compatibilidad
export const redirectShort = shortenRateLimit;
export const url_Short = redirectRateLimit;

export const limitAuthButton = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: !config.isProduction ? 2000 : 4,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Has alcanzado el límite diario de redirecciones. Por favor, inténtalo de nuevo mañana.",
    handler: rateLimitErrorHandler("Has alcanzado el límite diario de redirecciones. Por favor, inténtalo de nuevo mañana."),
    keyGenerator: (req: Request): string => {
        return ipKeyGenerator(req.ip || '');
    }
});