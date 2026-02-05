import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "../repository/userAuthRepository.js"
import { sendVerificationEmail } from "../services/sendEmails.js"
import { turso } from "../Database/databases.js"
import { validateRegistration } from "../utils/validateUserData.js"
import { hashPassword, comparePassword } from "../utils/password_encrypt.js"
import { generateVerificationCode } from "../utils/codeValidatedEmail.js"
import { RequestModel } from "../models/types.js"
import { config } from "../config.js"
import { generateJWTToken } from "../utils/jwt.js"
import crypto from "crypto";
import path from "path";

const authControllerRepository = new AuthRepository(turso);
const { configCookiesParams } = config;
const tokenVerifyEmail = crypto.randomUUID;

export class userAuthController {
    constructor(private authControllerRepository: AuthRepository) { }

    homeAuthController = async (req: RequestModel, res: Response) => {
        res.sendFile(path.join(process.cwd(), "public", "auth.html"));
    }

    authRegisterController = async (req: RequestModel, res: Response) => {
        try {
            if (!req.body) {
                console.error("authRegisterController: req.body is undefined");
                return res.status(400).json({ message: "Request body is missing" });
            }

            const { username, email, password } = req.body;
            const validation = validateRegistration({ username, email, password });

            if (!validation.isValid) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validation.errors
                });
            }

            const existingEmail = await this.authControllerRepository.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: "Email already in use." });
            }

            const passwordHash = await hashPassword(password);
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
            console.error("Error in creater user processing:", error);
            res.status(500).json({ message: "Error al crear el usuario." });
        }
    }

    authLoginController = async (req: RequestModel, res: Response) => {
        try {
            if (!req.body) {
                return res.status(400).json({ message: "Request body is missing" });
            }

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

            const token = generateJWTToken(email);
            res.cookie("emailSendToVerifyUser", token, {
                httpOnly: config.configCookiesParams.httpOnly,
                secure: config.configCookiesParams.secure,
                sameSite: config.configCookiesParams.sameSite,
                maxAge: 60 * 1000, // 1 minuto
                path: config.configCookiesParams.path
            });
            res.status(200).json({ message: "Login successful.", token, email });
        } catch (error) {
            console.error("Error in authLoginController:", error);
            res.status(500).json({ message: "Error in login process." });
        }
    }

    authVerifyEmailHomeController = async (req: RequestModel, res: Response) => {
        const verificationCode = generateVerificationCode();
        const cookieRaw = req.cookies['emailSendToVerifyUser']; 

        if (!cookieRaw) {
            return res.redirect("/api/v1/auth");
        }

        // await this.authControllerRepository.savedVerificationCode(dataCookies.email, verificationCode);
        // sendVerificationEmail(dataCookies.email, verificationCode);
        res.sendFile(path.join(process.cwd(), "public", "verifyEmail.html"));
    }

    postAuthVerifyEmailController = async (req: RequestModel, res: Response) => {
        try {
            const dataCookies = JSON.parse(req.cookies['emailSendToVerifyUser']);
            const { code } = req.body;
            const email = dataCookies.email;

            // if (!email) {
            //     return res.status(400).json({ message: "Email is required." });
            // }

            const user = await this.authControllerRepository.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: "User not found." });
            }

            // if (!code) {
            //     return res.status(400).json({ message: "Code is required." });
            // }

            // const user = await this.authControllerRepository.findByEmail(email); 
            // if (!user) {
            //     return res.status(400).json({ message: "User not found." });
            // }

            // const codeMatch = await this.authControllerRepository.verifyVerificationCode(email, code);
            // if (!codeMatch) {
            //     return res.status(400).json({ message: "Invalid code." });
            // } 
 
            // await this.authControllerRepository.updateUsedVerificationCode(email);
            const token = generateJWTToken(email);
            req.userEmail = email;
 
            res.clearCookie('emailSendToVerifyUser');
            res.cookie("authTokenAuthotized", token, {
                httpOnly: configCookiesParams.httpOnly,
                secure: configCookiesParams.secure,
                sameSite: configCookiesParams.sameSite,
                maxAge: configCookiesParams.maxAge,
                path: '/'
            })
            res.status(200).json({ message: "Login successful." });
        } catch (error) {
            console.error("Error in postAuthVerifyEmailController:", error);
            res.status(500).json({ message: "Error in verification process." });
        }
    }
}   