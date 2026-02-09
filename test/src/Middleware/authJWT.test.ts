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
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks(); 
    });

    describe('authJWT', () => {
        it('should redirect if no auth token in cookies', () => {
            authJWT(req as Request, res as Response, next);
            expect(res.redirect).toHaveBeenCalledWith('/api/v1/auth');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() if token is valid', () => {
            req.cookies = { authTokenAuthotized: 'valid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(null, { userId: '123' });
            });

            authJWT(req as Request, res as Response, next);
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret', expect.any(Function));
            expect(next).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should redirect if token is invalid', () => {
            req.cookies = { authTokenAuthotized: 'invalid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => { 
                callback(new Error('Invalid token'), null);
            });

            authJWT(req as Request, res as Response, next);
            expect(res.redirect).toHaveBeenCalledWith('/api/v1/auth');
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('verifySendToEmail', () => {
        it('should redirect if no token in query', () => {
            verifySendToEmail(req as Request, res as Response, next);
            expect(res.redirect).toHaveBeenCalledWith('/api/v1/auth');
        });

        it('should call next() if token is valid', () => {
            req.query = { token: 'valid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(null, { email: 'test@test.com' });
            });

            verifySendToEmail(req as Request, res as Response, next);
            expect(next).toHaveBeenCalled();
        });

        it('should redirect if token is invalid', () => {
            req.query = { token: 'invalid-token' };
            (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            verifySendToEmail(req as Request, res as Response, next);
            expect(res.redirect).toHaveBeenCalledWith('/api/v1/auth');
        });
    });
});
