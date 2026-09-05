import { Response, Request, NextFunction } from "express";
import { AuthService } from "../services/authService.js"
import { config } from "../config.js"
import { AppError } from "../utils/AppError.js";
import { sendOk } from "../utils/responseFormat.js";

const { configCookiesParams } = config;

export class AuthController {
    constructor(private authService: AuthService) { }

    authRegisterController = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body) {
            return next(new AppError(409, "El cuerpo de la solicitud es obligatorio"));
        }

        const { username, email, password } = req.body;
        const { tempToken } = await this.authService.register({ username, email, password });

        res.cookie("emailSendToVerifyUser", JSON.stringify({ token: tempToken }), {
            ...configCookiesParams,
            maxAge: 2 * 60 * 1000
        });

        return sendOk(res, undefined, "Usuario creado correctamente, código enviado al email", 201);
    }

    authLoginController = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body) {
            return next(new AppError(409, "El cuerpo de la solicitud es obligatorio"));
        }

        const { email, password } = req.body;
        const { tempToken, user } = await this.authService.login({ email, password });

        res.cookie("emailSendToVerifyUser", JSON.stringify({ token: tempToken }), {
            ...configCookiesParams,
            maxAge: 2 * 60 * 1000
        });
        return sendOk(res, { user }, "Inicio de sesión correcto, código enviado al email");
    }

    postAuthVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
        const { code, email } = req.body;
        if (!email || !code) {
            return next(new AppError(400, "El código y el email son obligatorios"));
        }

        const { authToken } = await this.authService.verifyEmailCode({ email, code });
        return sendOk(res, { authToken }, "Inicio de sesión correcto.");
    }
}