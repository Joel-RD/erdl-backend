import { Client } from "@libsql/client";
import { CreateUser, IAuthRepository } from "../models/types.js"
import logger from "../utils/logger.js";

export class AuthRepository implements IAuthRepository {
    constructor(private DB: Client) { }

    async findByEmail(email: string): Promise<{ id: number; name: string; email: string; password_hash: string } | null> {
        try {
            const result = await this.DB.execute({
                sql: "SELECT * FROM users WHERE email = ? limit 1",
                args: [email]
            });
            return result.rows[0] ? result.rows[0] as unknown as { id: number; name: string; email: string; password_hash: string } : null;
        } catch(error) {
            logger.error("Error search user by email: ", error)
            throw new Error(`Error search user by email: ${error}`);
        }
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
            logger.error("Error creating user in repository:", error);
            return false;
        }
    }

    async savedVerificationCode(email: string, code: string): Promise<void> {
        try {
            await this.DB.execute({
                sql: "INSERT OR REPLACE INTO verification_codes (email, code) VALUES (?, ?)",
                args: [email, code]
            });
        } catch (error) {
            logger.error("Error saving verification code in repository:", error);
            throw new Error(`Error saving verification code in repository ${error}`);
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
            logger.error("Error verifying verification code in repository:", error);
            throw new Error(`Error verifying verification code in repository: ${error}`)
        }
    }

    async updateUsedVerificationCode(email: string): Promise<void> {
        try {
            await this.DB.execute({
                sql: "UPDATE verification_codes SET used = 1 WHERE email = ?",
                args: [email]
            });
        } catch (error) {
            logger.error("Error updating used verification code in repository:", error);
            throw new Error(`Error updating used verification code in repository ${error}`)
        }
    }

    async getActiveVerificationCode(email: string): Promise<{ expires_at: string } | null> {
        try {
            const result = await this.DB.execute({
                sql: `SELECT * FROM verification_codes 
                      WHERE email = ? AND used = 0 AND expires_at > DATETIME('now')`,
                args: [email]
            });
            return result.rows[0] ? result.rows[0] as unknown as { expires_at: string } : null;
        } catch (error) {
            console.error("Error getting active verification code:", error);
            throw new Error(`Errpr getting active verification code ${error}`)
        }
    }
}