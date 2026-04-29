import { jest } from '@jest/globals';
import { authJWT, verifySendToEmail } from '../../../src/Middleware/authJWT';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Middleware: authJWT', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            cookies: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authJWT', () => {
        it('should return 401 if no auth token in cookies', () => {
            authJWT(req as Request, res as Response, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: No token provided" });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() if token is valid', async () => {
            const validToken = jwt.sign({ email: 'test@test.com', userId: '123' }, config.jwtSecret);
            req.cookies = { authTokenAuthorized: validToken };

            authJWT(req as Request, res as Response, next);
            await wait(50);

            expect(next).toHaveBeenCalled();
            expect(req.userEmail).toBe('test@test.com');
        });

        it('should return 401 if token is invalid', async () => {
            req.cookies = { authTokenAuthorized: 'invalid-token' };

            authJWT(req as Request, res as Response, next);
            await wait(50);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: Invalid token" });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('verifySendToEmail', () => {
        it('should return 401 if no token in cookies', () => {
            verifySendToEmail(req as Request, res as Response, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: No verification session" });
        });

        it('should call next() if token is valid', async () => {
            const validToken = jwt.sign({ email: 'test@test.com' }, config.jwtSecret);
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: validToken }) };

            verifySendToEmail(req as Request, res as Response, next);
            await wait(50);

            expect(next).toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', async () => {
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: 'invalid-token' }) };

            verifySendToEmail(req as Request, res as Response, next);
            await wait(50);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: Invalid verification token" });
        });
    });
});
