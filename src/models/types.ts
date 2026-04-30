import type { Request } from "express";

export type RequestModel = Request & {
    userEmail?: string
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

export interface IAuthRepository {
    findByEmail(email: string): Promise<{ id: number; name: string; email: string; password_hash: string } | null>;
    create(user: {
        username: string;
        email: string;
        passwordHash: string;
        name?: string;
        lastName?: string;
    }): Promise<boolean>;
    savedVerificationCode(email: string, code: string): Promise<void>;
    verifyVerificationCode(email: string, code: string): Promise<boolean>;
    updateUsedVerificationCode(email: string): Promise<void>;
    getActiveVerificationCode(email: string): Promise<{ expires_at: string } | null>;
}