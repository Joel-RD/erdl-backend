import { IUrlRepository } from "../models/types.js"
import { Client } from "@libsql/client";
import logger from "../utils/logger.js";

export class UrlRepository implements IUrlRepository {
    constructor(private DB: Client) { }

    async findById(short_url: string): Promise<string | null> {
        try {
            const result = await this.DB.execute({
                sql: "SELECT original_url FROM urls WHERE short_url = ? AND is_active = 1",
                args: [short_url]
            });

            if (!result.rows || result.rows.length === 0) {
                return null;
            }

            return result.rows[0].original_url as string;
        } catch (error) {
            logger.error('Error en findById repository', { error, short_url });
            throw new Error(`Error buscando la URL en el repositorio: ${error}`);
        }
    }

    async create(short_url: string, original_url: string): Promise<string> {
        try {
            await this.DB.execute({
                sql: "INSERT INTO urls (original_url, short_url) VALUES (?, ?)",
                args: [original_url, short_url]
            });
            return short_url;
        } catch (error) {
            logger.error('Error en create repository', { error, short_url, original_url });
            throw new Error(`Error creando la URL en el repositorio: ${error}`);
        }
    }
}