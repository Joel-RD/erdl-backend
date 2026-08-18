import jwt from "jsonwebtoken";
import { CustomJwtPayload } from "../models/types.js"
import { Response, NextFunction } from "express";
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js";

const JWT_SECRET = config.jwtSecret;

function verifyToken(token: string): Promise<CustomJwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: unknown, decoded: unknown) => {
            if (err) return reject(err);
            resolve(decoded as CustomJwtPayload);
        });
    });
}

function respondTokenError(err: unknown, res: Response): void {
    if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "No autorizado: token expirado" });
        return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ message: "Prohibido: firma de token inválida" });
        return;
    }

    res.status(401).json({ message: "No autorizado: falló la verificación del token" });
}

export async function authJWT(req: Request, res: Response, next: NextFunction) {
    const tokenCookies = req.cookies.authTokenAuthorized;

    if (!tokenCookies) {
        return res.status(401).json({ message: "No autorizado: no se proporcionó token" });
    }

    try {
        const user = await verifyToken(tokenCookies);
        req.userEmail = user.userEmail;
        next();
    } catch (err) {
        respondTokenError(err, res);
    }
}

export async function verifySendToEmail(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.emailSendToVerifyUser) {
        return res.status(401).json({ message: "No autorizado: no hay sesión de verificación" });
    }

    let tokenParser: { token?: string };
    try {
        tokenParser = JSON.parse(req.cookies.emailSendToVerifyUser);
    } catch {
        return res.status(401).json({ message: "No autorizado: sesión de verificación inválida" });
    }

    const token = tokenParser?.token;
    if (!token) {
        return res.status(401).json({ message: "No autorizado: no hay token de verificación" });
    }

    const bodyEmail = req.body?.email;
    if (!bodyEmail) {
        return next();
    }

    try {
        const decoded = await verifyToken(token);
        if (decoded.userEmail !== bodyEmail) {
            return res.status(403).json({ message: "Prohibido: el token no corresponde al email indicado" });
        }
        next();
    } catch (err) {
        respondTokenError(err, res);
    }
}