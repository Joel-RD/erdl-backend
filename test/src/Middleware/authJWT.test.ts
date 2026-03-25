import { authJWT, verifySendToEmail } from '../../../src/Middleware/authJWT';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/config', () => ({
    config: {
        jwtSecret: 'test-secret'
    }
}));

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

        it('should call next() if token is valid', () => {
            req.cookies = { authTokenAuthorized: 'valid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(null, { userId: '123', email: 'test@test.com' });
            });

            authJWT(req as Request, res as Response, next);
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret', expect.any(Function));
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            req.cookies = { authTokenAuthorized: 'invalid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            authJWT(req as Request, res as Response, next);
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

        it('should call next() if token is valid', () => {
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: 'valid-token' }) };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(null, { email: 'test@test.com' });
            });

            verifySendToEmail(req as Request, res as Response, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            req.cookies = { emailSendToVerifyUser: JSON.stringify({ token: 'invalid-token' }) };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            verifySendToEmail(req as Request, res as Response, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: Invalid verification token" });
        });
    });
});
