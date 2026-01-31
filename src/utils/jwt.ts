import jwt from "jsonwebtoken";
import { config } from "../config";

const JWT_SECRET = config.jwtSecret;

interface User {
    userEmail: string;
}

export const generateJWTToken = (userEmail: string): string => {
    return jwt.sign({ userEmail: userEmail }, JWT_SECRET, { expiresIn: "2d" });
};