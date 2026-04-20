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

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.userEmail = (decoded as any).email;
    next();
  });
}

const JWT_SECRET_EMAIL = config.jwtSecret;

export function verifySendToEmail(req: Request, res: Response, next: NextFunction) {
  const tokenCookies = req.cookies.emailSendToVerifyUser;

  if (!tokenCookies) {
    return res.status(401).json({ message: "Unauthorized: No verification session" });
  }

  const parsed = JSON.parse(tokenCookies);
  const token = parsed.token;

  jwt.verify(token, JWT_SECRET_EMAIL, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid verification token" });
    }
    req.userEmail = (decoded as any).email;
    next();
  });
}