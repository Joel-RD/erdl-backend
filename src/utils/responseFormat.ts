import { Response } from "express";
import { AppError } from "./AppError.js";
import { ApiErrorBody, ApiSuccess } from "../models/types.js";

export function sendOk<T>(res: Response, data?: T, message = "", status = 200) {
    const body: ApiSuccess<T> = { success: true, message };
    if (data !== undefined) {
        body.data = data;
    }
    return res.status(status).json(body);
}

export function buildErrorBody(err: AppError): ApiErrorBody {
    const body: ApiErrorBody = {
        success: false,
        message: err.message,
        error: {
            code: err.code,
            message: err.message
        }
    };
    if (err.details !== undefined) {
        body.error.details = err.details;
    }
    return body;
}