import { Router } from "express";
import { z } from "zod";
import { updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
export const usersRouter = Router();
usersRouter.patch(
  "/me",
  requireAuth,
  validate(
    z.object({
      name: z.string().trim().min(2).max(80).optional(),
      timezone: z.string().max(80).optional(),
      defaultCurrency: z.string().length(3).optional(),
    }),
  ),
  updateMe,
);
