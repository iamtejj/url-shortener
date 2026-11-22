import { ZodError } from "zod";
import { AppError } from "../errors.js";
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.issues },
        });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: { code: err.code, message: err.message, details: err.details },
        });
    }
    console.error(err); // real logging comes on Day 10
    res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
};
//# sourceMappingURL=error-handler.js.map