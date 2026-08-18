import { Client } from "@libsql/client";
import { CreateUser, IAuthRepository, UserAuthData } from "../models/types.js"
import { AttemptScope, BLOCK_DURATION_HOURS, MAX_ATTEMPTS } from "../utils/attemptLimiter.js"
import logger from "../utils/logger.js";

interface AttemptColumns {
    table: string;
    countColumn: string;
    blockedColumn: string;
}

export class AuthRepository implements IAuthRepository {
    constructor(private DB: Client) { }

    async findByEmail(email: string): Promise<UserAuthData | null> {
        try {
            const result = await this.DB.execute({
                sql: "SELECT * FROM users WHERE email = ? limit 1",
                args: [email]
            });
            return result.rows[0] ? result.rows[0] as unknown as UserAuthData : null;
        } catch (error) {
            logger.error("Error search user by email: ", error)
            throw new Error(`Error search user by email: ${error}`);
        }
    }

    async create(user: CreateUser): Promise<UserAuthData> {
        try {
            await this.DB.execute({
                sql: "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                args: [
                    user.username,
                    user.email,
                    user.passwordHash,
                ]
            });

            const created = await this.findByEmail(user.email);
            if (!created) {
                throw new Error("Usuario no encontrado después de la inserción");
            }
            return created;
        } catch (error) {
            logger.error("Error creating user in repository:", error);
            throw new Error(`Error creating user in repository: ${error}`);
        }
    }

    async savedVerificationCode(email: string, code: string): Promise<void> {
        try {
            await this.DB.execute({
                sql: `INSERT INTO verification_codes (email, code, expires_at)
                      VALUES (?, ?, DATETIME('now', '+10 minutes'))
                      ON CONFLICT(email) DO UPDATE SET
                          code = excluded.code,
                          expires_at = excluded.expires_at,
                          used = 0,
                          used_at = NULL`,
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
                sql: `SELECT * FROM verification_codes
                      WHERE email = ? AND code = ? AND used = 0 AND expires_at > DATETIME('now')`,
                args: [email, code]
            });
            return !!result.rows[0];
        } catch (error) {
            logger.error("Error verifying verification code in repository:", error);
            throw new Error(`Error verifying verification code in repository: ${error}`)
        }
    }

    async markEmailVerified(email: string): Promise<void> {
        try {
            await this.DB.execute({
                sql: "UPDATE users SET email_verified = 1 WHERE email = ?",
                args: [email]
            });
        } catch (error) {
            logger.error("Error marking email as verified in repository:", error);
            throw new Error(`Error marking email as verified in repository: ${error}`)
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
            logger.error("Error getting active verification code:", error);
            throw new Error(`Error getting active verification code ${error}`)
        }
    }

    async checkBlocked(scope: AttemptScope, email: string): Promise<{ blocked: boolean; retryAfterMinutes: number }> {
        try {
            const { table, blockedColumn } = this.attemptColumns(scope);
            const result = await this.DB.execute({
                sql: `SELECT CAST((julianday(${blockedColumn}) - julianday('now')) * 1440 AS INTEGER) + 1 AS minutes_left
                      FROM ${table}
                      WHERE email = ? AND ${blockedColumn} > DATETIME('now')`,
                args: [email]
            });

            const minutesLeft = result.rows[0]?.minutes_left;
            return minutesLeft !== undefined
                ? { blocked: true, retryAfterMinutes: Number(minutesLeft) }
                : { blocked: false, retryAfterMinutes: 0 };
        } catch (error) {
            logger.error("Error checking blocked attempts in repository:", error);
            throw new Error(`Error checking blocked attempts in repository ${error}`);
        }
    }

    async registerAttempt(scope: AttemptScope, email: string): Promise<{ blocked: boolean; attemptsLeft: number }> {
        try {
            const { table, countColumn, blockedColumn } = this.attemptColumns(scope);

            const increment = await this.DB.execute({
                sql: `UPDATE ${table} SET ${countColumn} = ${countColumn} + 1 WHERE email = ?`,
                args: [email]
            });

            if (increment.rowsAffected === 0) {
                return { blocked: false, attemptsLeft: MAX_ATTEMPTS };
            }

            const countResult = await this.DB.execute({
                sql: `SELECT ${countColumn} AS attempt_count FROM ${table} WHERE email = ?`,
                args: [email]
            });

            const count = Number(countResult.rows[0]?.attempt_count ?? 0);

            if (count >= MAX_ATTEMPTS) {
                const hours = BLOCK_DURATION_HOURS[scope];
                await this.DB.execute({
                    sql: `UPDATE ${table}
                          SET ${blockedColumn} = DATETIME('now', '+${hours} hours'),
                              ${countColumn} = 0
                          WHERE email = ?`,
                    args: [email]
                });
                return { blocked: true, attemptsLeft: 0 };
            }

            return { blocked: false, attemptsLeft: MAX_ATTEMPTS - count };
        } catch (error) {
            logger.error("Error registering attempt in repository:", error);
            throw new Error(`Error registering attempt in repository ${error}`);
        }
    }

    async resetAttempts(scope: AttemptScope, email: string): Promise<void> {
        try {
            const { table, countColumn, blockedColumn } = this.attemptColumns(scope);
            await this.DB.execute({
                sql: `UPDATE ${table} SET ${countColumn} = 0, ${blockedColumn} = NULL WHERE email = ?`,
                args: [email]
            });
        } catch (error) {
            logger.error("Error resetting attempts in repository:", error);
            throw new Error(`Error resetting attempts in repository ${error}`);
        }
    }

    private attemptColumns(scope: AttemptScope): AttemptColumns {
        switch (scope) {
            case "email":
                return { table: "users", countColumn: "email_attempt_count", blockedColumn: "email_blocked_until" };
            case "password":
                return { table: "users", countColumn: "password_attempt_count", blockedColumn: "password_blocked_until" };
            case "code":
                return { table: "verification_codes", countColumn: "attempt_count", blockedColumn: "blocked_until" };
        }
    }
}