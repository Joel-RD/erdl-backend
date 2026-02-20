import { userAuthJWToken } from '../../../src/utils/jwt';
import jwt from 'jsonwebtoken';

// Mock config to avoid loading .env files or failing if missing
jest.mock('../../../src/config', () => ({
    config: {
        jwtSecret: 'test-secret'
    }
}));

describe('generateJWTToken', () => {
    it('should generate a valid JWT token', () => {
        const email = 'test@example.com';
        const token = userAuthJWToken(email);

        expect(typeof token).toBe('string');

        // Verify the token with the mocked secret
        const decoded = jwt.verify(token, 'test-secret') as any;
        expect(decoded).toHaveProperty('userEmail', email);
    });
});
