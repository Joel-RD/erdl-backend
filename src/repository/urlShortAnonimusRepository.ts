import { IUserRepository } from "../models/types.js"
import { Client } from "@libsql/client";
import { log } from "../utils/logger.js";

export class UserRepository implements IUserRepository {
    private cache = new Map<string, string>();
    private readonly MAX_CACHE_SIZE = 10000;

    constructor(private DB: Client) { }

    async findById(short_url: string): Promise<string | null> {
        // Check cache first
        const cached = this.cache.get(short_url);
        if (cached) return cached;

        try {
            const result = await this.DB.execute({
                sql: "SELECT original_url FROM urls WHERE short_url = ? AND is_active = 1",
                args: [short_url]
            });

            if (!result.rows || result.rows.length === 0) {
                return null;
            }

            const originalUrl = result.rows[0].original_url as string;
            
            // Save to cache
            if (this.cache.size >= this.MAX_CACHE_SIZE) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(short_url, originalUrl);

            return originalUrl;
        } catch (error) {
            log.error('Error en findById repository', { error, short_url });
            return null;
        }
    }

    async create(short_url: string, original_url: string): Promise<string | null> {
        try {
            await this.DB.execute({
                sql: "INSERT INTO urls (original_url, short_url) VALUES (?, ?)",
                args: [original_url, short_url]
            });

            // Optimistically cache it
            if (this.cache.size < this.MAX_CACHE_SIZE) {
                this.cache.set(short_url, original_url);
            }

            return short_url;
        } catch (error) {
            log.error('Error en create repository', { error, short_url, original_url });
            return null;
        }
    }
}
