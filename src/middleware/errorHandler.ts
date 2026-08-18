import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        error: "Not Found",
        message: `Ruta ${req.method} ${req.path} no encontrada`
    });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        const body: Record<string, unknown> = { message: err.message };
        if (err.details !== undefined) body.details = err.details;
        return res.status(err.statusCode).json(body);
    }

    logger.error("Error no controlado:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: "Ocurrió un error inesperado"
    });
}