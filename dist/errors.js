export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(404, "NOT_FOUND", message);
    }
}
//# sourceMappingURL=errors.js.map