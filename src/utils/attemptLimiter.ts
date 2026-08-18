export const MAX_ATTEMPTS = 5;

export const BLOCK_DURATION_HOURS = {
    email: 2,
    password: 2,
    code: 1
} as const;

export type AttemptScope = keyof typeof BLOCK_DURATION_HOURS;
