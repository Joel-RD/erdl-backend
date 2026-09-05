import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../src/utils/AppError';

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

type ErrorHandlerModule = typeof import('../../../src/middleware/errorHandler.js');

let notFoundHandler: ErrorHandlerModule['notFoundHandler'];
let errorHandler: ErrorHandlerModule['errorHandler'];
let mockedLogger: { error: jest.Mock };

beforeAll(async () => {
    ({ notFoundHandler, errorHandler } = await import('../../../src/middleware/errorHandler.js'));
    mockedLogger = (await import('../../../src/utils/logger.js')).default as unknown as { error: jest.Mock };
});

describe('errorHandler middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { method: 'GET', path: '/unknown' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('notFoundHandler', () => {
        it('should respond 404 with the route info', () => {
            notFoundHandler(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ruta GET /unknown no encontrada',
                error: {
                    code: 'NOT_FOUND',
                    message: 'Ruta GET /unknown no encontrada'
                }
            });
        });
    });

    describe('errorHandler', () => {
        it('should respond with the AppError status code and message', () => {
            const error = new AppError(429, 'Demasiadas peticiones');

            errorHandler(error, req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(429);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Demasiadas peticiones',
                error: {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Demasiadas peticiones'
                }
            });
            expect(mockedLogger.error).not.toHaveBeenCalled();
        });

        it('should include details when the AppError has them', () => {
            const error = new AppError(400, 'Datos inválidos', ['campo requerido']);

            errorHandler(error, req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Datos inválidos',
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Datos inválidos',
                    details: ['campo requerido']
                }
            });
        });

        it('should keep the custom code when the AppError provides one', () => {
            const error = new AppError(409, 'El email ya está registrado', undefined, 'EMAIL_ALREADY_REGISTERED');

            errorHandler(error, req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'El email ya está registrado',
                error: {
                    code: 'EMAIL_ALREADY_REGISTERED',
                    message: 'El email ya está registrado'
                }
            });
        });

        it('should respond 500 and log for unexpected errors', () => {
            const error = new Error('boom');

            errorHandler(error, req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ocurrió un error inesperado',
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Ocurrió un error inesperado'
                }
            });
            expect(mockedLogger.error).toHaveBeenCalled();
        });
    });
});