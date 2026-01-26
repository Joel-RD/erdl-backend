import { Database } from "better-sqlite3";
import { IUserRepository } from "../interfaceDB";

export class UserRepository implements IUserRepository {
    constructor(private DB: Database) { }

    async findById(short_url: string): Promise<string | null> {
        const row = this.DB.prepare(`SELECT original_url FROM urls WHERE short_url = ?`).get(short_url);

        if (!row) {
            return null;
        }

        return row.original_url;
    }

    async create(short_url: string, original_url: string): Promise<string | null> {
        const result = this.DB.prepare(`INSERT INTO urls (original_url, short_url) VALUES (?, ?)`).run(original_url, short_url);


        if (result.changes > 0) {
            return short_url;
        }

        return null;
    }

}
