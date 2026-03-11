import { Base62Converter } from "./base62Convert.js";

/**
 * Códigos de error para SnowflakeGenerator
 */
export enum SnowflakeErrorCode {
    INVALID_MACHINE_ID = "SNOWFLAKE_INVALID_MACHINE_ID",
    CLOCK_REGRESSED = "SNOWFLAKE_CLOCK_REGRESSED",
    SEQUENCE_OVERFLOW = "SNOWFLAKE_SEQUENCE_OVERFLOW",
}

/**
 * Error personalizado para SnowflakeGenerator
 */
export class SnowflakeError extends Error {
    constructor(
        message: string,
        public readonly code: SnowflakeErrorCode,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "SnowflakeError";
        Error.captureStackTrace(this, SnowflakeError);
    }
}

/**
 * NanoSnowflakeGenerator - Generador de IDs usando nanoseconds
 * 
 * Utiliza timestamps en nanosegundos para generar IDs más cortos
 * mientras mantiene la compatibilidad con el formato Snowflake.
 */
export class NanoSnowflakeGenerator {
    // Constantes de clase para valores bit
    private static readonly TIMESTAMP_BITS = 20;
    private static readonly MACHINE_ID_BITS = 10;
    private static readonly SEQUENCE_BITS = 12;

    // Máscaras y límites derivados
    private static readonly MAX_MACHINE_ID = (1 << NanoSnowflakeGenerator.MACHINE_ID_BITS) - 1; // 1023
    private static readonly MAX_SEQUENCE = (1 << NanoSnowflakeGenerator.SEQUENCE_BITS) - 1; // 4095
    private static readonly TIMESTAMP_MASK = (1n << BigInt(NanoSnowflakeGenerator.TIMESTAMP_BITS)) - 1n;

    private static readonly EPOCH = 1767225600000000000n; // 2026-01-01 en nanoseconds

    private machineId: number;
    private sequence: number = 0;
    private lastTimestamp: bigint = -1n;

    constructor(machineId: number) {
        this.validateMachineId(machineId);
        this.machineId = machineId;
    }

    /**
     * Valida que el machineId esté en el rango válido
     */
    private validateMachineId(machineId: number): void {
        if (!Number.isInteger(machineId)) {
            throw new SnowflakeError(
                `El machineId debe ser un número entero. Valor recibido: ${machineId}`,
                SnowflakeErrorCode.INVALID_MACHINE_ID,
                { machineId, validRange: `[0, ${NanoSnowflakeGenerator.MAX_MACHINE_ID}]` }
            );
        }

        if (machineId < 0 || machineId > NanoSnowflakeGenerator.MAX_MACHINE_ID) {
            throw new SnowflakeError(
                `El machineId debe estar entre 0 y ${NanoSnowflakeGenerator.MAX_MACHINE_ID}. Valor recibido: ${machineId}`,
                SnowflakeErrorCode.INVALID_MACHINE_ID,
                { machineId, validRange: `[0, ${NanoSnowflakeGenerator.MAX_MACHINE_ID}]` }
            );
        }
    }

    /**
     * Obtiene el timestamp actual en nanoseconds
     */
    private getCurrentTimestamp(): bigint {
        return BigInt(Date.now()) * 1_000_000n;
    }

    /**
     * Genera el siguiente ID único
     */
    private getNextId(): bigint {
        let timestamp = this.getCurrentTimestamp();

        if (timestamp < this.lastTimestamp) {
            throw new SnowflakeError(
                `Reloj del sistema retrocedió. No se pueden generar IDs. Timestamp actual: ${timestamp}, último timestamp: ${this.lastTimestamp}`,
                SnowflakeErrorCode.CLOCK_REGRESSED,
                { currentTimestamp: timestamp, lastTimestamp: this.lastTimestamp }
            );
        }

        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & NanoSnowflakeGenerator.MAX_SEQUENCE;

            if (this.sequence === 0) {
                // Esperar hasta el siguiente nanosegundo
                while (timestamp <= this.lastTimestamp) {
                    timestamp = this.getCurrentTimestamp();
                }
            }
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = timestamp;

        const adjustedTimestamp = (timestamp - NanoSnowflakeGenerator.EPOCH) & NanoSnowflakeGenerator.TIMESTAMP_MASK;
        
        const id = (adjustedTimestamp << BigInt(NanoSnowflakeGenerator.MACHINE_ID_BITS + NanoSnowflakeGenerator.SEQUENCE_BITS)) |
            (BigInt(this.machineId) << BigInt(NanoSnowflakeGenerator.SEQUENCE_BITS)) |
            BigInt(this.sequence);

        return id;
    }

    /**
     * Genera un ID único para URL corta en formato Base62
     */
    generateShortUrl(): string {
        const uniqueId = this.getNextId();
        return Base62Converter.encodeInteger(uniqueId);
    }

    /**
     * Genera un ID numérico directo
     */
    generateId(): bigint {
        return this.getNextId();
    }
}
