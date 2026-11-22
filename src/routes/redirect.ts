import express from "express";
import type { Request, Response } from "express";
import { resolveLink } from "../services/links.js";
import { codeParamSchema } from "./links.js";
const router = express.Router();


router.get("/:code", async (req: Request, res: Response) => { 
    const { code } = codeParamSchema.parse(req.params);
    const originalUrl = await resolveLink(code);
    res.redirect(302, originalUrl);
});

export default router;