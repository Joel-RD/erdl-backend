import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { AuthController } from '../../../src/controllers/authController';

describe('AuthController', () => {
    let authService: {
        register: jest.Mock;
        login: jest.Mock;
        verifyEmailCode: jest.Mock;
    };
    let controller: AuthController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        authService = {
            register: jest.fn().mockResolvedValue({ tempToken: 'temp-token-123' }),
            login: jest.fn().mockResolvedValue({ tempToken: 'temp-token-123', user: { id: 1, username: 'test', email: 'test@gmail.com' } }),
            verifyEmailCode: jest.fn().mockResolvedValue({ authToken: 'auth-token-123' })
        };
        controller = new AuthController(authService as any);
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('authRegisterController', () => {
        it('should return 409 when there is no request body', async () => {
            req.body = undefined;

            await controller.authRegisterController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'El cuerpo de la solicitud es obligatorio' });
            expect(authService.register).not.toHaveBeenCalled();
        });

        it('should register the user and set the verification cookie', async () => {
            req.body = { username: 'test', email: 'test@gmail.com', password: 'StrongP@ssw0rd!' };

            await controller.authRegisterController(req as Request, res as Response);

            expect(authService.register).toHaveBeenCalledWith({
                username: 'test',
                email: 'test@gmail.com',
                password: 'StrongP@ssw0rd!'
            });
            expect(res.cookie).toHaveBeenCalledWith(
                'emailSendToVerifyUser',
                expect.stringContaining('temp-token-123'),
                expect.objectContaining({ maxAge: 2 * 60 * 1000 })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado correctamente, código enviado al email' });
        });
    });

    describe('authLoginController', () => {
        it('should return 409 when there is no request body', async () => {
            req.body = undefined;

            await controller.authLoginController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'El cuerpo de la solicitud es obligatorio' });
            expect(authService.login).not.toHaveBeenCalled();
        });

        it('should login and set the verification cookie with the user', async () => {
            req.body = { email: 'test@gmail.com', password: 'StrongP@ssw0rd!' };

            await controller.authLoginController(req as Request, res as Response);

            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@gmail.com',
                password: 'StrongP@ssw0rd!'
            });
            expect(res.cookie).toHaveBeenCalledWith(
                'emailSendToVerifyUser',
                expect.stringContaining('temp-token-123'),
                expect.objectContaining({ maxAge: 2 * 60 * 1000 })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Inicio de sesión correcto, código enviado al email',
                user: { id: 1, username: 'test', email: 'test@gmail.com' }
            });
        });
    });

    describe('postAuthVerifyEmailController', () => {
        it('should return 400 when email or code are missing', async () => {
            req.body = { email: 'test@gmail.com' };

            await controller.postAuthVerifyEmailController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'El código y el email son obligatorios' });
            expect(authService.verifyEmailCode).not.toHaveBeenCalled();
        });

        it('should verify the code and set the auth token cookie', async () => {
            req.body = { email: 'test@gmail.com', code: 'ABC123' };

            await controller.postAuthVerifyEmailController(req as Request, res as Response);

            expect(authService.verifyEmailCode).toHaveBeenCalledWith({ email: 'test@gmail.com', code: 'ABC123' });
            expect(res.cookie).toHaveBeenCalledWith('authTokenAuthorized', 'auth-token-123', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Inicio de sesión correcto.' });
        });
    });
});