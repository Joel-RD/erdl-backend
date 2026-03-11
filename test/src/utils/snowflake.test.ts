import { NanoSnowflakeGenerator, SnowflakeError, SnowflakeErrorCode } from '../../../src/utils/snowflake';

describe('NanoSnowflakeGenerator', () => {
    describe('Constructor', () => {
        it('should create instance with valid machineId (0)', () => {
            const generator = new NanoSnowflakeGenerator(0);
            expect(generator).toBeInstanceOf(NanoSnowflakeGenerator);
        });

        it('should create instance with valid machineId (1)', () => {
            const generator = new NanoSnowflakeGenerator(1);
            expect(generator).toBeInstanceOf(NanoSnowflakeGenerator);
        });

        it('should create instance with max valid machineId (1023)', () => {
            const generator = new NanoSnowflakeGenerator(1023);
            expect(generator).toBeInstanceOf(NanoSnowflakeGenerator);
        });

        it('should throw error for negative machineId', () => {
            expect(() => new NanoSnowflakeGenerator(-1)).toThrow(SnowflakeError);
            expect(() => new NanoSnowflakeGenerator(-1)).toThrow(/machineId debe estar entre 0 y 1023/i);
        });

        it('should throw error for machineId greater than 1023', () => {
            expect(() => new NanoSnowflakeGenerator(1024)).toThrow(SnowflakeError);
            expect(() => new NanoSnowflakeGenerator(1024)).toThrow(/machineId debe estar entre 0 y 1023/i);
        });

        it('should throw error for non-integer machineId', () => {
            expect(() => new NanoSnowflakeGenerator(1.5)).toThrow(SnowflakeError);
            expect(() => new NanoSnowflakeGenerator(1.5)).toThrow(/machineId debe ser un número entero/i);
        });

        it('should throw error for string machineId', () => {
            expect(() => new NanoSnowflakeGenerator("1" as any)).toThrow(SnowflakeError);
            expect(() => new NanoSnowflakeGenerator("1" as any)).toThrow(/machineId debe ser un número entero/i);
        });
    });

    describe('generateId', () => {
        let generator: NanoSnowflakeGenerator;

        beforeEach(() => {
            generator = new NanoSnowflakeGenerator(1);
        });

        it('should generate unique IDs', () => {
            const id1 = generator.generateId();
            const id2 = generator.generateId();
            expect(id1).not.toBe(id2);
        });

        it('should generate increasing IDs', () => {
            const id1 = generator.generateId();
            const id2 = generator.generateId();
            expect(id2).toBeGreaterThan(id1);
        });

        it('should return bigint type', () => {
            const id = generator.generateId();
            expect(typeof id).toBe('bigint');
        });

        it('should generate IDs within valid bit range', () => {
            const id = generator.generateId();
            // 20 + 10 + 12 = 42 bits
            const maxValue = (1n << 42n) - 1n;
            expect(id).toBeGreaterThanOrEqual(0n);
            expect(id).toBeLessThan(maxValue);
        });
    });

    describe('generateShortUrl', () => {
        let generator: NanoSnowflakeGenerator;

        beforeEach(() => {
            generator = new NanoSnowflakeGenerator(1);
        });

        it('should return a string', () => {
            const shortUrl = generator.generateShortUrl();
            expect(typeof shortUrl).toBe('string');
        });

        it('should return non-empty string', () => {
            const shortUrl = generator.generateShortUrl();
            expect(shortUrl.length).toBeGreaterThan(0);
        });

        it('should return 8-character string', () => {
            const shortUrl = generator.generateShortUrl();
            expect(shortUrl.length).toBe(8);
        });

        it('should generate different short URLs for sequential calls', () => {
            const url1 = generator.generateShortUrl();
            const url2 = generator.generateShortUrl();
            expect(url1).not.toBe(url2);
        });

        it('should only contain valid Base62 characters', () => {
            const shortUrl = generator.generateShortUrl();
            const base62Regex = /^[0-9A-Za-z]+$/;
            expect(base62Regex.test(shortUrl)).toBe(true);
        });
    });
});
