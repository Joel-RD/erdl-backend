import { Response, Request } from "express";
import { AuthService } from "../services/authService.js"
import { config } from "../config.js"

const { configCookiesParams } = config;

export class AuthController {
    constructor(private authService: AuthService) { }

    authRegisterController = async (req: Request, res: Response) => {
        if (!req.body) {
            return res.status(409).json({ message: "El cuerpo de la solicitud es obligatorio" });
        }

        const { username, email, password } = req.body;
        const { tempToken } = await this.authService.register({ username, email, password });

        res.cookie("emailSendToVerifyUser", JSON.stringify({ token: tempToken }), {
            ...configCookiesParams,
            maxAge: 2 * 60 * 1000
        });

        res.status(201).json({ message: "Usuario creado correctamente, código enviado al email" });
    }

    authLoginController = async (req: Request, res: Response) => {
        if (!req.body) {
            return res.status(409).json({ message: "El cuerpo de la solicitud es obligatorio" });
        }

        const { email, password } = req.body;
        const { tempToken, user } = await this.authService.login({ email, password });

        res.cookie("emailSendToVerifyUser", JSON.stringify({ token: tempToken }), {
            ...configCookiesParams,
            maxAge: 2 * 60 * 1000
        });
        res.status(200).json({ message: "Inicio de sesión correcto, código enviado al email", user });
    }

    postAuthVerifyEmailController = async (req: Request, res: Response) => {
        const { code, email } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "El código y el email son obligatorios" });
        }

        const { authToken } = await this.authService.verifyEmailCode({ email, code });
        res.cookie("authTokenAuthorized", authToken, configCookiesParams);
        res.status(200).json({ message: "Inicio de sesión correcto." });
    }
}