import { validateEmail, validatePassword, validateRegistration } from '../../../src/utils/validateUserData';

describe('validateUserData', () => {
    describe('validateEmail', () => {
        it('should return valid for allowed domains', () => {
            expect(validateEmail('test@gmail.com').isValid).toBe(true);
            expect(validateEmail('user@outlook.com').isValid).toBe(true);
        });

        it('should return invalid for disallowed domains', () => {
            const result = validateEmail('test@randomdomain.com');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Dominio no permitido');
        });

        it('should return invalid for malformed emails', () => {
            expect(validateEmail('invalid-email').isValid).toBe(false);
            expect(validateEmail('test@.com').isValid).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should return valid for strong passwords', () => {
            const result = validatePassword('StrongP@ssw0rd!');
            expect(result.isValid).toBe(true);
            expect(result.strength).toMatch(/fuerte|muy fuerte/);
        });

        it('should return invalid for weak passwords', () => {
            const result = validatePassword('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should require special characters', () => {
            const result = validatePassword('Password123456');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Debe contener al menos un carácter especial (!@#$%^&*...)');
        });
    });

    describe('validateRegistration', () => {
        it('should return valid for correct registration data', () => {
            const data = {
                email: 'test@gmail.com',
                password: 'StrongP@ssw0rd!',
                name: 'Test',
                lastName: 'User'
            };
            const result = validateRegistration(data);
            expect(result.isValid).toBe(true);
        });

        it('should aggregate errors from email and password validation', () => {
            const data = {
                email: 'invalid-email',
                password: 'weak',
            };
            const result = validateRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1); // At least one for email and one for password
        });
    });
});
