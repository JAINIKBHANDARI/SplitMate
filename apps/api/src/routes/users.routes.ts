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
      upiId: z.string().trim().max(80).optional().or(z.literal("")),
      phone: z.string().trim().max(30).optional().or(z.literal("")),
      notificationPreferences: z
        .object({
          emailInvites: z.boolean().optional(),
          recurringReminders: z.boolean().optional(),
          budgetAlerts: z.boolean().optional(),
          settlementUpdates: z.boolean().optional(),
        })
        .optional(),
    }),
  ),
  updateMe,
);
