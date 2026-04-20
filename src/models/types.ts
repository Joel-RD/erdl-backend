import type { Request } from "express";

export interface ConfigCookiesParams {
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean | "lax" | "strict" | "none";
    maxAge: number;
    path: string;
}

export interface IUserRepository {
    findById(short_url: string): Promise<string | null>;
    create(short_url: string, original_url: string): Promise<string | null>;
}

export interface CreateUser {
    username: string;
    email: string;
    passwordHash: string;
}

export interface IUserAuthRepository {
    findByEmail(email: string): Promise<any | null>;
    create(user: {
        username: string;
        email: string;
        passwordHash: string;
        name?: string;
        lastName?: string;
    }): Promise<boolean>;
    savedVerificationCode(email: string, code: string): Promise<boolean>;
    verifyVerificationCode(email: string, code: string): Promise<boolean>;
    updateUsedVerificationCode(email: string): Promise<boolean>;
}

export interface IUserDataFrontendRepository {
    getDataUser(email: string): Promise<string | boolean>;
}
