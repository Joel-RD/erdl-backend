import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import { Request, Response } from 'express'
import { config } from '../config';

export const redirectShort = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: !config.isProduction ? 200000 : 50000,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Has alcanzado el límite diario de redirecciones. Por favor, inténtalo de nuevo mañana.",
    keyGenerator: (req: Request, _res: Response): string => {
        if (req.query.id_short) {
            return req.query.id_short as string;
        }
        return ipKeyGenerator(req.ip || '');
    }
});

export const url_Short = rateLimit({
    windowMs: 7 * 24 * 60 * 60 * 1000,
    limit: !config.isProduction ? 20000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Has alcanzado el límite semanal de URLs acortadas. Por favor, inténtalo de nuevo la próxima semana.",
    keyGenerator: (req: Request, _res: Response): string => {
        if (req.query.id_short) {
            return req.query.id_short as string;
        }
        return ipKeyGenerator(req.ip || '');
    }
});

export const limitAuthButton = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: !config.isProduction ? 2000 : 4,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Has alcanzado el límite diario de redirecciones. Por favor, inténtalo de nuevo mañana.",
    keyGenerator: (req: Request, _res: Response): string => {
        if (req.query.id_short) {
            return req.query.id_short as string;
        }
        return ipKeyGenerator(req.ip || '');
    }
});