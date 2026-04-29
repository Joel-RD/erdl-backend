import { generateShortUrl } from '../../../src/utils/shortId';

describe('generateShortUrl', () => {
    it('should return a string', () => {
        const result = generateShortUrl();
        expect(typeof result).toBe('string');
    });

    it('should return non-empty string', () => {
        const result = generateShortUrl();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return 10-character string (nanoid default)', () => {
        const result = generateShortUrl();
        expect(result.length).toBe(10);
    });

    it('should generate unique IDs on sequential calls', () => {
        const url1 = generateShortUrl();
        const url2 = generateShortUrl();
        expect(url1).not.toBe(url2);
    });

    it('should only contain valid URL-safe characters (alphanumeric, _, -)', () => {
        const result = generateShortUrl();
        const validCharsRegex = /^[0-9A-Za-z_-]+$/;
        expect(validCharsRegex.test(result)).toBe(true);
    });

    it('should generate multiple unique IDs in a batch', () => {
        const results = new Set<string>();
        for (let i = 0; i < 100; i++) {
            results.add(generateShortUrl());
        }
        expect(results.size).toBe(100);
    });
});
