import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { buildErrorBody } from "../utils/responseFormat.js";
import logger from "../utils/logger.js";

export function notFoundHandler(req: Request, res: Response) {
    const error = new AppError(404, `Ruta ${req.method} ${req.path} no encontrada`);
    res.status(error.statusCode).json(buildErrorBody(error));
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(buildErrorBody(err));
    }

    logger.error("Error no controlado:", err);
    const error = new AppError(500, "Ocurrió un error inesperado");
    res.status(error.statusCode).json(buildErrorBody(error));
}