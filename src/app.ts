import express from "express";
import type { Request, Response } from "express";
import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";
import { errorHandler } from "./middleware/error-handler.js";
import { NotFoundError } from "./errors.js";

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/links", linksRouter);

// Short URLs are served from the root: GET /:code. Must come after /health and /links.
app.use(redirectRouter);

// Unknown routes -> 404 through the error handler
app.use((_req: Request, _res: Response) => {
  throw new NotFoundError("Route not found");
});

// Must be registered last
app.use(errorHandler);

export default app;
