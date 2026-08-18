import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config';

type AuthJWTModule = typeof import('../../../src/Middleware/authJWT.js');

let authJWT: AuthJWTModule['authJWT'];
let verifySendToEmail: AuthJWTModule['verifySendToEmail'];

beforeAll(async () => {
    ({ authJWT, verifySendToEmail } = await import('../../../src/Middleware/authJWT.js'));
});

describe('Middleware: authJWT', () => {
    let req: Partial<Request> & { userEmail?: string };
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
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
        it('should return 401 if no auth token is provided in cookies', async () => {
            await authJWT(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: no se proporcionó token' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() and set req.userEmail when the token is valid', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { authTokenAuthorized: validToken };

            await authJWT(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.userEmail).toBe('test@example.com');
        });

        it('should return 401 when the token is expired', async () => {
            const expiredToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret, { expiresIn: -1 });
            req.cookies = { authTokenAuthorized: expiredToken };

            await authJWT(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: token expirado' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 when the token signature is invalid', async () => {
            const invalidToken = jwt.sign({ userEmail: 'test@example.com' }, 'wrong-secret');
            req.cookies = { authTokenAuthorized: invalidToken };

            await authJWT(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prohibido: firma de token inválida' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 for a malformed token', async () => {
            req.cookies = { authTokenAuthorized: 'not-a-jwt' };

            await authJWT(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prohibido: firma de token inválida' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('verifySendToEmail', () => {
        it('should return 401 if there is no verification session cookie', async () => {
            await verifySendToEmail(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: no hay sesión de verificación' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 when the cookie is not valid JSON', async () => {
            req.cookies = { emailSendToVerifyUser: '{invalid json' };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: sesión de verificación inválida' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 when the cookie has no token', async () => {
            req.cookies = { emailSendToVerifyUser: JSON.stringify({}) };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: no hay token de verificación' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() when there is no email in the body', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = {};

            await verifySendToEmail(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
        });

        it('should call next() when the token matches the body email', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = { email: 'test@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 403 when the token does not match the body email', async () => {
            const validToken = jwt.sign({ userEmail: 'test@example.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };
            req.body = { email: 'other@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prohibido: el token no corresponde al email indicado' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 when the token is invalid', async () => {
            const invalidToken = jwt.sign({ userEmail: 'test@example.com' }, 'wrong-secret');
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: invalidToken }) };
            req.body = { email: 'test@example.com' };

            await verifySendToEmail(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prohibido: firma de token inválida' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});