import { hashPassword, comparePassword } from '../../../src/utils/password_encrypt';
import bcrypt from 'bcryptjs';

describe('Password Encrypt Utils', () => {
    describe('hashPassword', () => {
        it('should hash a password correctly', async () => {
            const password = 'mySecretPassword';
            const hash = await hashPassword(password);

            expect(hash).not.toBe(password);
            expect(hash).toMatch(/^\$2[ayb]\$.{56}$/); // Basic bcrypt hash regex
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching password and hash', async () => {
            const password = 'password123';
            const hash = await bcrypt.hash(password, 10);

            const isMatch = await comparePassword(password, hash);
            expect(isMatch).toBe(true);
        });

        it('should return false for non-matching password', async () => {
            const password = 'password123';
            const hash = await bcrypt.hash('otherPassword', 10);

            const isMatch = await comparePassword(password, hash);
            expect(isMatch).toBe(false);
        });
    });
});
