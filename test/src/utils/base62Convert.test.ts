import { Base62Converter } from '../../../src/utils/base62Convert';

describe('Base62Converter', () => {
    describe('encodeInteger', () => {
        it('should return "00000000" for input 0', () => {
            expect(Base62Converter.encodeInteger(0n)).toBe('00000000');
        });

        it('should correctly encode small numbers with padding', () => {
            expect(Base62Converter.encodeInteger(1n)).toBe('00000001');
            expect(Base62Converter.encodeInteger(61n)).toBe('0000000z');
            expect(Base62Converter.encodeInteger(62n)).toBe('00000010');
        });

        it('should correctly encode large BigInts', () => {
            // 62^2 = 3844, so 3844 should be '100' -> padded to '00000100'
            expect(Base62Converter.encodeInteger(3844n)).toBe('00000100');
        });

        it('should throw error for negative numbers', () => {
            expect(() => Base62Converter.encodeInteger(-1n)).toThrow('El valor debe ser un entero no negativo');
        });

        it('should truncate to last 8 chars if result exceeds 8', () => {
            // 62^8 is a large number, should truncate to last 8 chars
            const largeNumber = 62n ** 10n; // Very large number
            const result = Base62Converter.encodeInteger(largeNumber);
            expect(result.length).toBe(8);
        });
    });
});
