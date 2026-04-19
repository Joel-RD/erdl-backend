import { Client } from "@libsql/client";
import { CreateUser, IUserAuthRepository } from "../models/types.js"

export class AuthRepository implements IUserAuthRepository {
    constructor(private DB: Client) { }

    async findByEmail(email: string): Promise<any | null> {
        const result = await this.DB.execute({
            sql: "SELECT * FROM users WHERE email = ? limit 1",
            args: [email]
        });
        return result.rows[0] || null;
    }

    async create(user: CreateUser): Promise<boolean> {
        try {
            const result = await this.DB.execute({
                sql: "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                args: [
                    user.username,
                    user.email,
                    user.passwordHash,
                ]
            });

            return !!result;
        } catch (error) {
            console.error("Error creating user in repository:", error);
            return false;
        }
    }

    async savedVerificationCode(email: string, code: string): Promise<boolean> {
        try {
            const user = await this.findByEmail(email);
            const userId = user ? user.id : null;

            const result = await this.DB.execute({
                sql: "INSERT OR REPLACE INTO verification_codes (user_id, email, code) VALUES (?, ?, ?)",
                args: [userId, email, code]
            });

            return !!result;
        } catch (error) {
            console.error("Error saving verification code in repository:", error);
            return false;
        }
    }

    async verifyVerificationCode(email: string, code: string): Promise<boolean> {
        try {
            const result = await this.DB.execute({
                sql: "SELECT * FROM verification_codes WHERE email = ? AND code = ?",
                args: [email, code]
            });

            return !!result.rows[0];
        } catch (error) {
            console.error("Error verifying verification code in repository:", error);
            return false;
        }
    }

    async updateUsedVerificationCode(email: string): Promise<boolean> {
        try {
            const result = await this.DB.execute({
                sql: "UPDATE verification_codes SET used = 1 WHERE email = ?",
                args: [email]
            });

            return !!result;
        } catch (error) {
            console.error("Error updating used verification code in repository:", error);
            return false;
        }
    }

    async getActiveVerificationCode(email: string): Promise<any | null> {
        try {
            const result = await this.DB.execute({
                sql: `SELECT * FROM verification_codes 
                      WHERE email = ? AND used = 0 AND expires_at > DATETIME('now')`,
                args: [email]
            });
            return result.rows[0] || null;
        } catch (error) {
            console.error("Error getting active verification code:", error);
            return null;
        }
    }
}