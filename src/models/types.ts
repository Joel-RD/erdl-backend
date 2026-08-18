import type { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AttemptScope } from "../utils/attemptLimiter.js";

export type RequestModel = Request & {
    userEmail?: string
}

export interface CustomJwtPayload extends JwtPayload {
    userEmail: string,
}

export interface ConfigCookiesParams {
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean | "lax" | "strict" | "none";
    maxAge: number;
    path: string;
}

export interface IUrlRepository {
    findById(short_url: string): Promise<string | null>;
    create(short_url: string, original_url: string): Promise<string | null>;
}

export interface CreateUser {
    username: string;
    email: string;
    passwordHash: string;
}

export interface UserAuthData {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    name?: string | null;
    last_name?: string | null;
    email_attempt_count?: number;
    email_blocked_until?: string | null;
    password_attempt_count?: number;
    password_blocked_until?: string | null;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<UserAuthData | null>;
    create(user: {
        username: string;
        email: string;
        passwordHash: string;
        name?: string;
        lastName?: string;
    }): Promise<UserAuthData>;
    savedVerificationCode(email: string, code: string): Promise<void>;
    verifyVerificationCode(email: string, code: string): Promise<boolean>;
    markEmailVerified(email: string): Promise<void>;
    updateUsedVerificationCode(email: string): Promise<void>;
    getActiveVerificationCode(email: string): Promise<{ expires_at: string } | null>;
    checkBlocked(scope: AttemptScope, email: string): Promise<{ blocked: boolean; retryAfterMinutes: number }>;
    registerAttempt(scope: AttemptScope, email: string): Promise<{ blocked: boolean; attemptsLeft: number }>;
    resetAttempts(scope: AttemptScope, email: string): Promise<void>;
}