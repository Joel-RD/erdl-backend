import { SnowflakeGenerator } from '../../../src/utils/snowflake';

describe('SnowflakeGenerator', () => {
    let generator: SnowflakeGenerator;

    beforeEach(() => {
        generator = new SnowflakeGenerator(1);
    });

    it('should generate unique IDs', () => {
        const id1 = (generator as any).getNextId();
        const id2 = (generator as any).getNextId();
        expect(id1).not.toBe(id2);
    });

    it('should generate increasing IDs', () => {
        const id1 = BigInt((generator as any).getNextId());
        const id2 = BigInt((generator as any).getNextId());
        expect(id2).toBeGreaterThan(id1);
    });

    it('should generate a short URL string', () => {
        const shortUrl = generator.generateShortUrl();
        expect(typeof shortUrl).toBe('string');
        expect(shortUrl.length).toBeGreaterThan(0);
    });

    it('should generate different short URLs for sequential calls', () => {
        const url1 = generator.generateShortUrl();
        const url2 = generator.generateShortUrl();
        expect(url1).not.toBe(url2);
    });
});
  