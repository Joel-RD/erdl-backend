import { Base62Converter } from "./base62Convert.js";

export class SnowflakeGenerator {
    private machineId: number;
    private sequence: number = 0;
    private lastTimestamp: number = -1;

    private readonly EPOCH = 1704067200000; // 2024-01-01
    private readonly MACHINE_ID_BITS = 5;
    private readonly SEQUENCE_BITS = 5;

    constructor(machineId: number) {
        this.machineId = machineId & ((1 << this.MACHINE_ID_BITS) - 1);
    }

    private getNextId(): string {
        let timestamp = Date.now();

        if (timestamp < this.lastTimestamp) {
            throw new Error("Reloj del sistema retrocedió. No se pueden generar IDs.");
        }

        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & ((1 << this.SEQUENCE_BITS) - 1);
            if (this.sequence === 0) {
                while (timestamp <= this.lastTimestamp) {
                    timestamp = Date.now();
                }
            }
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = timestamp;

        const id = (BigInt(timestamp - this.EPOCH) << BigInt(this.MACHINE_ID_BITS + this.SEQUENCE_BITS)) |
            (BigInt(this.machineId) << BigInt(this.SEQUENCE_BITS)) |
            BigInt(this.sequence);

        return String(id);
    }

    generateShortUrl(): string {
        const uniqueId = this.getNextId();
        return Base62Converter.encodeInteger(BigInt(uniqueId));
    }
}