import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config';
import { AppError } from '../../../src/utils/AppError';

type AuthJWTModule = typeof import('../../../src/middleware/authJWT.js');

let authJWT: AuthJWTModule['authJWT'];
let verifySendToEmail: AuthJWTModule['verifySendToEmail'];

beforeAll(async () => {
    ({ authJWT, verifySendToEmail } = await import('../../../src/middleware/authJWT.js'));
});

function expectAppError(next: jest.Mock, statusCode: number, message: string, code?: string) {
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(statusCode);
    expect(err.message).toBe(message);
    if (code !== undefined) {
        expect(err.code).toBe(code);
    }
}

describe('Middleware: authJWT', () => {
    let req: Partial<Request> & { userEmail?: string };
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            headers: {},
            cookies: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authJWT', () => {
        it('should return 401 if no auth token is provided in the header', async () => {
            await authJWT(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: no se proporcionó token', 'TOKEN_MISSING');
            expect(res.json).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalledWith();
        });

        it('should return 401 if the header does not use the Bearer scheme', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.headers = { authorization: validToken };

            await authJWT(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: no se proporcionó token', 'TOKEN_MISSING');
        });

        it('should call next() and set req.userEmail when the token is valid', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.headers = { authorization: `Bearer ${validToken}` };

            await authJWT(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
            expect(req.userEmail).toBe('test@example.com');
        });

        it('should return 401 when the token is expired', async () => {
            const expiredToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret, { expiresIn: -1 });
            req.headers = { authorization: `Bearer ${expiredToken}` };

            await authJWT(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: token expirado', 'TOKEN_EXPIRED');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 403 when the token signature is invalid', async () => {
            const invalidToken = jwt.sign({ userEmail: 'test@example.com' }, 'wrong-secret');
            req.headers = { authorization: `Bearer ${invalidToken}` };

            await authJWT(req as Request, res as Response, next);

            expectAppError(next, 403, 'Prohibido: firma de token inválida', 'TOKEN_INVALID');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 403 for a malformed token', async () => {
            req.headers = { authorization: 'Bearer not-a-jwt' };

            await authJWT(req as Request, res as Response, next);

            expectAppError(next, 403, 'Prohibido: firma de token inválida', 'TOKEN_INVALID');
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('verifySendToEmail', () => {
        it('should return 401 if there is no verification session cookie', async () => {
            await verifySendToEmail(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: no hay sesión de verificación', 'VERIFICATION_SESSION_MISSING');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 401 when the cookie is not valid JSON', async () => {
            req.cookies = { emailSendToVerifyUser: '{invalid json' };

            await verifySendToEmail(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: sesión de verificación inválida', 'VERIFICATION_SESSION_INVALID');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 401 when the cookie has no token', async () => {
            req.cookies = { emailSendToVerifyUser: JSON.stringify({}) };

            await verifySendToEmail(req as Request, res as Response, next);

            expectAppError(next, 401, 'No autorizado: no hay token de verificación', 'VERIFICATION_TOKEN_MISSING');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should call next() when there is no email in the body', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = {};

            await verifySendToEmail(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next() when the token matches the body email', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = { email: 'test@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should return 403 when the token does not match the body email', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = { email: 'other@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expectAppError(next, 403, 'Prohibido: el token no corresponde al email indicado', 'TOKEN_EMAIL_MISMATCH');
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 403 when the token is invalid', async () => {
            const invalidToken = jwt.sign({ userEmail: 'test@example.com' }, 'wrong-secret');
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: invalidToken }) };
            req.body = { email: 'test@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expectAppError(next, 403, 'Prohibido: firma de token inválida', 'TOKEN_INVALID');
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});