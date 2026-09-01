const DEFAULT_CODE_BY_STATUS: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    410: "GONE",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR"
};

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: unknown,
        public code: string = DEFAULT_CODE_BY_STATUS[statusCode] ?? "INTERNAL_SERVER_ERROR"
    ) {
        super(message);
        this.name = "AppError";
    }
}