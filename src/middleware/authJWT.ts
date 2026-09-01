import jwt from "jsonwebtoken";
import { CustomJwtPayload } from "../models/types.js"
import { NextFunction, Response } from "express";
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";

const JWT_SECRET = config.jwtSecret;

function verifyToken(token: string): Promise<CustomJwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: unknown, decoded: unknown) => {
            if (err) return reject(err);
            resolve(decoded as CustomJwtPayload);
        });
    });
}

function respondTokenError(err: unknown, next: NextFunction): void {
    if (err instanceof jwt.TokenExpiredError) {
        next(new AppError(401, "No autorizado: token expirado", undefined, "TOKEN_EXPIRED"));
        return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
        next(new AppError(403, "Prohibido: firma de token inválida", undefined, "TOKEN_INVALID"));
        return;
    }

    next(new AppError(401, "No autorizado: falló la verificación del token", undefined, "TOKEN_VERIFICATION_FAILED"));
}

export async function authJWT(req: Request, res: Response, next: NextFunction) {
    const tokenCookies = req.cookies.authTokenAuthorized;

    if (!tokenCookies) {
        return next(new AppError(401, "No autorizado: no se proporcionó token", undefined, "TOKEN_MISSING"));
    }

    try {
        const user = await verifyToken(tokenCookies);
        req.userEmail = user.userEmail;
        next();
    } catch (err) {
        respondTokenError(err, next);
    }
}

export async function verifySendToEmail(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.emailSendToVerifyUser) {
        return next(new AppError(401, "No autorizado: no hay sesión de verificación", undefined, "VERIFICATION_SESSION_MISSING"));
    }

    let tokenParser: { token?: string };
    try {
        tokenParser = JSON.parse(req.cookies.emailSendToVerifyUser);
    } catch {
        return next(new AppError(401, "No autorizado: sesión de verificación inválida", undefined, "VERIFICATION_SESSION_INVALID"));
    }

    const token = tokenParser?.token;
    if (!token) {
        return next(new AppError(401, "No autorizado: no hay token de verificación", undefined, "VERIFICATION_TOKEN_MISSING"));
    }

    const bodyEmail = req.body?.email;
    if (!bodyEmail) {
        return next();
    }

    try {
        const decoded = await verifyToken(token);
        if (decoded.userEmail !== bodyEmail) {
            return next(new AppError(403, "Prohibido: el token no corresponde al email indicado", undefined, "TOKEN_EMAIL_MISMATCH"));
        }
        next();
    } catch (err) {
        respondTokenError(err, next);
    }
}