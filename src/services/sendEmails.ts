import nodemailer, { TransportOptions } from "nodemailer";
import { config } from "../config.js";
import { generateVerificationCode } from "../utils/codeValidatedEmail.js";

export const codeGenerate = generateVerificationCode();

const templateEmailHtml = (code: string) => {
    return `
  <h1> Verifica tu correo electrónico </h1>
  <p>
    Para completar el registro, por favor introduce el siguiente código de verificación:
  </p>
  <h3>${code}</h3>

  <p>
    El código de verificación es válido por 10 minutos.
  </p>
  `;
};

const transport = nodemailer.createTransport({
    host: config.emailHost,
    port: Number(config.emailPort),
    secure: config.emailSecure === 'true',
    auth: {
        user: config.emailUser,
        pass: config.emailPass
    }
} as TransportOptions);

const sendMail = async (to: string, subject: string, text: string, html: string) => {
    try {
        const info = await transport.sendMail({
            from: `"Midnight Services" <${config.emailUser}>`,
            to,
            subject,
            text,
            html
        });
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

/**
 * Send a verification email to the user.
 * @param {string} to - Recipient email address.
 * @param {string} code - Verification code.
 * @returns {Promise<any>} NodeMailer result.
 */
export const sendVerificationEmail = async (to: string, code: string) => {
    const subject = "Verifica tu correo electrónico";
    const text = `Tu código de verificación es: ${code}`;
    const html = templateEmailHtml(code);
    return await sendMail(to, subject, text, html);
}