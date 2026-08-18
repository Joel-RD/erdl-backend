import { AuthRepository } from "../repository/authRepository.js";
import { emailService } from "./sendEmails.js";
import { hashPassword, comparePassword } from "../utils/password_encrypt.js";
import { generateVerificationCode } from "../utils/codeValidatedEmail.js";
import { emailValidJWToken, userAuthJWToken } from "../utils/jwt.js";
import { validateEmail, validateRegistration } from "../utils/validateUserData.js";
import { AppError } from "../utils/AppError.js";

interface LoginUser {
    id: number;
    username: string;
    email: string;
}

export class AuthService {
    constructor(private repository: AuthRepository) { }

    async register(input: { username: string; email: string; password: string }): Promise<{ tempToken: string }> {
        const validation = validateRegistration(input);
        if (!validation.isValid) {
            throw new AppError(401, "Los datos de registro no son válidos", validation.errors);
        }

        const emailBlock = await this.repository.checkBlocked("email", input.email);
        if (emailBlock.blocked) {
            throw new AppError(429, "Demasiados intentos de comprobación de email. Inténtalo de nuevo más tarde.", {
                retryAfterMinutes: emailBlock.retryAfterMinutes
            });
        }

        const existingEmail = await this.repository.findByEmail(input.email);
        await this.repository.registerAttempt("email", input.email);
        if (existingEmail) {
            throw new AppError(409, "El email ya está registrado");
        }

        const passwordHash = await hashPassword(input.password);
        await this.repository.create({ username: input.username, email: input.email, passwordHash });

        await this.repository.resetAttempts("email", input.email);

        const validCode = generateVerificationCode();
        await this.repository.savedVerificationCode(input.email, validCode);
        emailService.sendVerificationEmail(input.email, validCode);

        return { tempToken: emailValidJWToken(input.email) };
    }

    async login(input: { email: string; password: string }): Promise<{ tempToken: string; user: LoginUser }> {
        const emailValidation = validateEmail(input.email);
        if (!emailValidation.isValid || !input.password || input.password.trim() === "") {
            throw new AppError(401, "Credenciales no válidas", emailValidation.isValid ? undefined : [emailValidation.error]);
        }

        const emailBlock = await this.repository.checkBlocked("email", input.email);
        if (emailBlock.blocked) {
            throw new AppError(429, "Demasiados intentos de comprobación de email. Inténtalo de nuevo más tarde.", {
                retryAfterMinutes: emailBlock.retryAfterMinutes
            });
        }

        const user = await this.repository.findByEmail(input.email);
        await this.repository.registerAttempt("email", input.email);
        if (!user) {
            throw new AppError(404, "Email no encontrado");
        }

        const passwordBlock = await this.repository.checkBlocked("password", input.email);
        if (passwordBlock.blocked) {
            throw new AppError(429, "Demasiados intentos de contraseña. Cuenta temporalmente bloqueada.", {
                retryAfterMinutes: passwordBlock.retryAfterMinutes
            });
        }

        const passwordMatch = await comparePassword(input.password, user.password_hash);
        if (!passwordMatch) {
            await this.repository.registerAttempt("password", input.email);
            throw new AppError(401, "Contraseña incorrecta");
        }

        await this.repository.resetAttempts("email", input.email);
        await this.repository.resetAttempts("password", input.email);

        const activeCode = await this.repository.getActiveVerificationCode(input.email);
        if (activeCode) {
            const expiresAt = new Date(activeCode.expires_at);
            const minutesLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 60000);
            throw new AppError(429, "Ya hay un código de verificación activo.", { remainingMinutes: minutesLeft });
        }

        const validCode = generateVerificationCode();
        await this.repository.savedVerificationCode(input.email, validCode);
        emailService.sendVerificationEmail(input.email, validCode);

        return {
            tempToken: emailValidJWToken(input.email),
            user: { id: user.id, username: user.username, email: user.email }
        };
    }

    async verifyEmailCode(input: { email: string; code: string }): Promise<{ authToken: string }> {
        const codeBlock = await this.repository.checkBlocked("code", input.email);
        if (codeBlock.blocked) {
            throw new AppError(429, "Demasiados intentos de código de verificación. Inténtalo de nuevo más tarde.", {
                retryAfterMinutes: codeBlock.retryAfterMinutes
            });
        }

        const user = await this.repository.findByEmail(input.email);
        if (!user) {
            throw new AppError(404, "Email no encontrado");
        }

        const codeMatch = await this.repository.verifyVerificationCode(input.email, input.code);
        if (!codeMatch) {
            await this.repository.registerAttempt("code", input.email);
            throw new AppError(404, "Código de verificación incorrecto");
        }

        await this.repository.resetAttempts("code", input.email);
        await this.repository.updateUsedVerificationCode(input.email);
        await this.repository.markEmailVerified(input.email);

        return { authToken: userAuthJWToken(input.email) };
    }
}