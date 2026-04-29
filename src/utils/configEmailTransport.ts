import nodemailer, { TransportOptions } from "nodemailer";
import { config } from "../config.js";

const {configSendEmail} = config;

export const transport = nodemailer.createTransport({
    host: configSendEmail.emailHost,
    port: Number(configSendEmail.emailPort),
    secure: configSendEmail.emailSecure === 'true',
    auth: {
        user: configSendEmail.emailUser,
        pass: configSendEmail.emailPass
    }
} as TransportOptions);