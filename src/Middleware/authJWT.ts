import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js";

const JWT_SECRET = config.jwtSecret;

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const tokenCookies = req.cookies.authTokenAuthorized;

  if (!tokenCookies) {
    return res.redirect("/api/v1/auth");
  }

  const token = tokenCookies;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/api/v1/auth");
    }
    next();
  });
}

export async function verifySendToEmail(req: Request, res: Response, next: NextFunction) {

  if (!req.cookies.emailSendToVerifyUser) {
    res.redirect("/api/v1/auth");
    return
  }

  const tokenParser = JSON.parse(req.cookies.emailSendToVerifyUser)
  const tokenValidEmail = tokenParser.token

  if (!tokenValidEmail) {
    res.redirect("/api/v1/auth");
    return
  }
  const token = tokenValidEmail;
  jwt.verify(token as string, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.redirect("/api/v1/auth")
      return
    }
    next();
  });
}

export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction) {
  const tokenCookies = req.cookies.authTokenAuthorized;
  if (!tokenCookies) {
    return next();
  }

  jwt.verify(tokenCookies, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next();
    }
    return res.redirect("/api/v1/auth/user/profile");
  });
} 