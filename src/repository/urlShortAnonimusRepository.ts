import { IUserRepository } from "../models/types.js"
import { Client } from "@libsql/client";
import { log } from "../utils/logger.js";

export class UserRepository implements IUserRepository {
    constructor(private DB: Client) { }

    async findById(short_url: string): Promise<string | null> {
        try {
            const result = await this.DB.execute({
                sql: "SELECT original_url FROM urls WHERE short_url = ?",
                args: [short_url]
            });

            if (!result.rows) {
                return null;
            }

            return result.rows[0].original_url as string;
        } catch (error) {
            log.error('Error en findById', { error });
            return null;
        }
    }

    async create(short_url: string, original_url: string): Promise<string | null> {
        try {
            const result = await this.DB.execute({
                sql: "INSERT INTO urls (original_url, short_url) VALUES (?, ?)",
                args: [original_url, short_url]
            });

            if (!result.rows) {
                return null;
            }

            return short_url;
        } catch (error) {
            log.error('Error en create', { error });
            return null;
        }
    }
}
