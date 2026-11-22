import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { createLink, getLink } from "../services/links.js";

export const createLinkSchema = z.object({
  // Only http/https: a redirector must not send users to javascript:, ftp:, etc.
  url: z.url({ protocol: /^https?$/ }),
});

export const codeParamSchema = z.object({
  code: z.string().min(1).max(32),
});

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  // Throws ZodError on bad input; Express 5 forwards it to errorHandler (400).
  const { url } = createLinkSchema.parse(req.body);
  const link = await createLink(url);
  res.status(201).json(link);
});

export default router;
