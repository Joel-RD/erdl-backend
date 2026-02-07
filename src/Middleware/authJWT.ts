import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { RequestModel as Request } from "../models/types.js"
import { config } from "../config.js";

const JWT_SECRET = config.jwtSecret;

export function authJWT(req: Request, res: Response, next: NextFunction) {
  const tokenCookies = req.cookies.authTokenAuthotized;
  
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
  const tokenValidEmail = req.query.token;

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