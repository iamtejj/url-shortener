export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

// Thrown by the repository when a code already exists (Postgres error 23505).
// Not an HTTP error: the service decides what to do about it (retry).
export class DuplicateCodeError extends Error {
  constructor(public code: string) {
    super(`Code '${code}' already exists`);
  }
}