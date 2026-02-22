import { Response } from "express";
import { AuthRepository } from "../repository/userAuthRepository.js"
import { sendVerificationEmail } from "../services/sendEmails.js"
import { turso } from "../Database/databases.js"
import { validateRegistration } from "../utils/validateUserData.js"
import { hashPassword, comparePassword } from "../utils/password_encrypt.js"
import { generateVerificationCode } from "../utils/codeValidatedEmail.js"
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js"
import { emailValidJWToken, userAuthJWToken } from "../utils/jwt.js"
import path from "path";

const authControllerRepository = new AuthRepository(turso);
const { configCookiesParams } = config;


export class userAuthController {
    constructor(private authControllerRepository: AuthRepository) { }

    homeAuthController = async (req: Request, res: Response) => {
        res.sendFile(path.join(process.cwd(), "public", "auth.html"));
    }

    authRegisterController = async (req: Request, res: Response) => {
        try {
            // if (!req.body) {
            //     console.error("authRegisterController: req.body is undefined");
            //     return res.status(400).json({ message: "Request body is missing" });
            // }

            // const { username, email, password } = req.body;
            // const validation = validateRegistration({ username, email, password });

            // if (!validation.isValid) {
            //     return res.status(400).json({
            //         message: "Validation failed",
            //         errors: validation.errors
            //     });
            // }

            // const existingEmail = await this.authControllerRepository.findByEmail(email);
            // if (existingEmail) {
            //     return res.status(400).json({ message: "Email already in use." });
            // }

            // const passwordHash = await hashPassword(password);
            // const success = await this.authControllerRepository.create({
            //     username,
            //     email,
            //     passwordHash,
            // });

            // if (!success) {
            //     return res.status(500).json({ message: "Error creating user." });
            // }

            res.status(201).json({
                message: "User created successfully."
            });
        } catch (error) {
            console.error("Error in creater user processing:", error);
            res.status(500).json({ message: "Error al crear el usuario." });
        }
    }

    authLoginController = async (req: Request, res: Response) => {
        try {
            // if (!req.body) {
            //     return res.status(400).json({ message: "Request body is missing" });
            // }

            // const { email, password } = req.body;
            // const validation = validateRegistration({ email, password });

            // if (!validation.isValid) {
            //     return res.status(400).json({
            //         message: "Validation failed",
            //         errors: validation.errors
            //     });
            // }

            // const user = await this.authControllerRepository.findByEmail(email);
            // if (!user) {
            //     return res.status(400).json({ message: "User not found." });
            // }

            // const passwordMatch = await comparePassword(password, user.password_hash);
            // if (!passwordMatch) {
            //     return res.status(400).json({ message: "Invalid password." });
            // }

            // const token = emailValidJWToken(email);
            // res.cookie("emailSendToVerifyUser", JSON.stringify({ token, email }), {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: "strict",
            //     maxAge: 60 * 2 * 1000,
            //     path: "/"
            // });
            res.status(200).json({ message: "Login successful.", "token": "token", "email": "email" });
        } catch (error) {
            console.error("Error in authLoginController:", error);
            res.status(500).json({ message: "Error in login process." });
        }
    }

    authVerifyEmailHomeController = async (req: Request, res: Response) => {
        const verificationCode = generateVerificationCode();
        // const cookieRaw = req.cookies['emailSendToVerifyUser'];

        // const dataCookies = JSON.parse(cookieRaw);
        // await this.authControllerRepository.savedVerificationCode(dataCookies.email, verificationCode);
        // sendVerificationEmail(dataCookies.email, verificationCode);
        res.sendFile(path.join(process.cwd(), "public", "verifyEmail.html"));
    }

    postAuthVerifyEmailController = async (req: Request, res: Response) => {
        try {
            // const dataCookies = JSON.parse(req.cookies['emailSendToVerifyUser']);
            // const { code } = req.body;
            // const email = dataCookies.email;

            // if (!email) {
            //     return res.status(400).json({ message: "Email is required." });
            // }

            // const user = await this.authControllerRepository.findByEmail(email);
            // if (!user) {
            //     return res.status(400).json({ message: "User not found." });
            // }

            // if (!code) {
            //     return res.status(400).json({ message: "Code is required." });
            // }

            // const codeMatch = await this.authControllerRepository.verifyVerificationCode(email, code);
            // if (!codeMatch) {
            //     return res.status(400).json({ message: "Invalid code." });
            // }
            
            // await this.authControllerRepository.updateUsedVerificationCode(email);
            // const token = userAuthJWToken(email);
            // res.cookie("authTokenAuthorized", token, {
            //      httpOnly: true,
            //      secure: true,
            //      sameSite: "strict",
            //      maxAge: 7 * 24 * 60 * 60 * 1000,
            //      path: '/'
            //  })
            res.status(200).json({ message: "Login successful." });
        } catch (error) {
            console.error("Error in postAuthVerifyEmailController:", error);
            res.status(500).json({ message: "Error in verification process." });
        }
    }
}