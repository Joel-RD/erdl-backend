/**
 * Base62 encoding/decoding utilities for converting strings and integers
 * to a compact alphanumeric representation.
 * 
 * Charset: 0-9, a-z, A-Z (62 characters)
 */
// base62Convert.ts

const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = 62n;
const TARGET_LENGTH = 8;
const PAD_CHAR = "0";

export class Base62Converter {
    static encodeInteger(value: bigint): string {
        if (value < 0n) {
            throw new Error("El valor debe ser un entero no negativo");
        }

        if (value === 0n) {
            return PAD_CHAR.repeat(TARGET_LENGTH);
        }

        let result = "";
        let remaining = value;

        while (remaining > 0n) {
            const index = Number(remaining % BASE);
            result = BASE62_CHARS[index] + result;
            remaining = remaining / BASE;
        }

        // Pad with leading zeros if shorter than 8 chars
        if (result.length < TARGET_LENGTH) {
            result = result.padStart(TARGET_LENGTH, PAD_CHAR);
        }

        // If longer than 8 chars, take the last 8 (least significant)
        if (result.length > TARGET_LENGTH) {
            result = result.slice(-TARGET_LENGTH);
        }

        return result;
    }
}