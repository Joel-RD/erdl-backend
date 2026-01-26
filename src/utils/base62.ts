export class Base62Converter {
  private static readonly CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly BASE = 62;

  /**
   * Convierte un string a base62 (útil para IDs)
   */
  static encodeString(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let num = 0n;

    for (const byte of bytes) {
      num = num * 256n + BigInt(byte);
    }

    if (num === 0n) return '0';

    let result = '';
    while (num > 0n) {
      result = this.CHARSET[Number(num % 62n)] + result;
      num = num / 62n;
    }

    return result;
  }

  /**
   * Convierte un número (BigInt o number) a base62 directamente.
   * Esto genera strings mucho más cortos que encodeString para el mismo valor numérico.
   */
  static encodeInteger(num: bigint | number): string {
    let value = BigInt(num);

    if (value === 0n) return '0';

    let result = '';
    const base = BigInt(this.BASE);

    while (value > 0n) {
      const remainder = value % base;
      result = this.CHARSET[Number(remainder)] + result;
      value = value / base;
    }

    return result;
  }

}