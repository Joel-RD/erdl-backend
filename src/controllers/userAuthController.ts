import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "../repository/userAuthRepository"
import { sendVerificationEmail } from "../services/sendEmails"
import { turso } from "../Database/databases"
import { validateRegistration } from "../utils/validateUserData"
import { hashPassword, comparePassword } from "../utils/password_encrypt"
import { generateVerificationCode } from "../utils/codeValidatedEmail.js"
import { RequestModel } from "../models/types.js"
import { generateJWTToken } from "../utils/jwt.js"
import path from "path";

const authControllerRepository = new AuthRepository(turso);

let userEmail = "";
export class userAuthController {
    constructor(private authControllerRepository: AuthRepository) { }

    homeAuthController = async (req: RequestModel, res: Response) => {
        res.sendFile(path.join(process.cwd(), "public", "auth.html"));
    }

    authRegisterController = async (req: RequestModel, res: Response) => {
        try {
            const { username, email, password } = req.body;

            // 1. Validar datos
            const validation = validateRegistration({ username, email, password });

            if (!validation.isValid) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validation.errors
                });
            }

            // 2. Verificar si el usuario ya existe
            const existingEmail = await this.authControllerRepository.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: "Email already in use." });
            }

            // 3. Hashear contraseña
            const passwordHash = await hashPassword(password);

            // 4. Crear usuario
            const success = await this.authControllerRepository.create({
                username,
                email,
                passwordHash,
            });

            if (!success) {
                return res.status(500).json({ message: "Error creating user." });
            }

            res.status(201).json({
                message: "User created successfully."
            });
        } catch (error) {
            console.error("Error in authRegisterController:", error);
            res.status(500).json({ message: "Error al crear el usuario." });
        }
    }

    authLoginController = async (req: RequestModel, res: Response) => {
        try {
            const { email, password } = req.body;

            const validation = validateRegistration({ email, password });
            if (!validation.isValid) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validation.errors
                });
            }

            const user = await this.authControllerRepository.findByEmail(email);

            if (!user) {
                return res.status(400).json({ message: "User not found." });
            }

            const passwordMatch = await comparePassword(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(400).json({ message: "Invalid password." });
            }

            req.userEmail = email;
            userEmail = email;
            res.status(200).json({ message: "Login successful." });
        } catch (error) {
            console.error("Error in authLoginController:", error);
            res.status(500).json({ message: "Error in login process." });
        }
    }

    returnUserEmail = () => {
        return userEmail;
    }

    authVerifyEmailHomeController = async (req: RequestModel, res: Response) => {
        const verificationCode = generateVerificationCode();

        if (userEmail) {
            await this.authControllerRepository.savedVerificationCode(userEmail, verificationCode);
            sendVerificationEmail(userEmail, verificationCode);

            await this.authControllerRepository.savedVerificationCode(userEmail, verificationCode);
        }

        res.sendFile(path.join(process.cwd(), "public", "verifyEmail.html"));
    }

    postAuthVerifyEmailController = async (req: RequestModel, res: Response) => {
        const { code } = req.body;

        const user = await this.authControllerRepository.findByEmail(userEmail);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const codeMatch = await this.authControllerRepository.verifyVerificationCode(userEmail, code);
        if (!codeMatch) {
            return res.status(400).json({ message: "Invalid code." });
        }

        await this.authControllerRepository.updateUsedVerificationCode(userEmail);
        const token = generateJWTToken(userEmail);

        res.status(200).json({ message: "Login successful.", token: token });
    }
} 