import { generateVerificationCode } from '../../../src/utils/codeValidatedEmail';

describe('generateVerificationCode', () => {
    it('should generate a code of default length 6', () => {
        const code = generateVerificationCode();
        expect(code).toHaveLength(6);
    });

    it('should generate a code of specified length', () => {
        const length = 10;
        const code = generateVerificationCode(length);
        expect(code).toHaveLength(length);
    });

    it('should use default characters (alphanumeric)', () => {
        const code = generateVerificationCode(100);
        expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should use custom characters if provided', () => {
        const customChars = "ABC";
        const code = generateVerificationCode(10, customChars);
        expect(code).toMatch(/^[ABC]+$/);
    });
});
