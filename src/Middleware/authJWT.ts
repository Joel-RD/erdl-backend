import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

const JWT_SECRET = config.jwtSecret;

interface RequestModel extends Request {
  userEmail?: string;
}

export function authJWT(req: RequestModel, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).redirect("/api/v1/auth");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).redirect("/api/v1/auth");
    }

    req.userEmail = decoded as string;
    next();
  });
}