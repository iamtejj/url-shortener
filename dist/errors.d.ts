export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
    constructor(statusCode: number, code: string, message: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map