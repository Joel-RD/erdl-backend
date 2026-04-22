import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js";

const JWT_SECRET = config.jwtSecret;

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const tokenCookies = req.cookies.authTokenAuthorized;

  if (!tokenCookies) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = tokenCookies;

  jwt.verify(token, JWT_SECRET, (err: unknown, decoded: unknown) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.userEmail = (decoded as any).email;
    next();
  });
}

export async function verifySendToEmail(req: Request, res: Response, next: NextFunction) {

  if (!req.cookies.emailSendToVerifyUser) {
    res.status(401).json({ message: "Unauthorized: No verification session" });
    return
  }

  const tokenParser = JSON.parse(req.cookies.emailSendToVerifyUser)
  const tokenValidEmail = tokenParser.token

  if (!tokenValidEmail) {
    res.status(401).json({ message: "Unauthorized: No verification token" });
    return
  }
  const token = tokenValidEmail;
  jwt.verify(token as string, JWT_SECRET, (err: unknown, decoded: unknown) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized: Invalid verification token" })
      return
    }
    next();
  });
}