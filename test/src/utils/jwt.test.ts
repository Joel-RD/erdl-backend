import { userAuthJWToken, emailValidJWToken } from '../../../src/utils/jwt';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config';

describe('JWT Token Generation', () => {
    describe('userAuthJWToken', () => {
        it('should generate a valid JWT token', () => {
            const email = 'test@example.com';
            const token = userAuthJWToken(email);

            expect(typeof token).toBe('string');

            // Verify the token with the actual secret from config
            const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
            expect(decoded).toHaveProperty('userEmail', email);
        });

        it('should include expiration in 2 days', () => {
            const email = 'test@example.com';
            const token = userAuthJWToken(email);
            const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

            const now = Math.floor(Date.now() / 1000);
            const twoDaysInSeconds = 2 * 24 * 60 * 60;
            expect(decoded.exp).toBeGreaterThan(now);
            expect(decoded.exp).toBeLessThanOrEqual(now + twoDaysInSeconds + 10);
        });
    });

    describe('emailValidJWToken', () => {
        it('should generate a valid JWT token', () => {
            const email = 'verify@example.com';
            const token = emailValidJWToken(email);

            expect(typeof token).toBe('string');

            const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
            expect(decoded).toHaveProperty('userEmail', email);
        });

        it('should include expiration in 2 minutes', () => {
            const email = 'verify@example.com';
            const token = emailValidJWToken(email);
            const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

            const now = Math.floor(Date.now() / 1000);
            const twoMinutesInSeconds = 2 * 60;
            expect(decoded.exp).toBeGreaterThan(now);
            expect(decoded.exp).toBeLessThanOrEqual(now + twoMinutesInSeconds + 10);
        });
    });
});
