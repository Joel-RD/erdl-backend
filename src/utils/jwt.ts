import jwt from "jsonwebtoken";
import { config } from "../config.js";

const JWT_SECRET = config.jwtSecret;

interface User {
    userEmail: string;
}

export const userAuthJWToken = (userEmail: string): string => {
    return jwt.sign({ userEmail: userEmail }, JWT_SECRET, { expiresIn: "2d" });
};

export const emailValidJWToken = (userEmail: string): string => {
    return jwt.sign({ userEmail: userEmail }, JWT_SECRET, { expiresIn: "2m" });
};