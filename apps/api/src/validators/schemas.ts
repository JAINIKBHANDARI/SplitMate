import { z } from "zod";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(10).max(128),
  timezone: z.string().max(80).optional(),
  defaultCurrency: z.string().length(3).optional(),
});
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
});
export const groupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional(),
  currency: z.string().length(3).default("INR"),
  cover: z.string().max(30).optional(),
});
export const memberSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
});
export const roleSchema = z.object({ role: z.enum(["admin", "member"]) });
const participant = z.object({
  userId: objectId,
  included: z.boolean().default(true),
  shareMinor: z.number().int().nonnegative().optional(),
  percentage: z.number().finite().nonnegative().optional(),
  weight: z.number().finite().positive().optional(),
});
export const expenseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  amountMinor: z.number().int().positive(),
  category: z.string().trim().min(1).max(40),
  paidBy: objectId,
  splitType: z.enum(["equal", "exact", "percentage", "shares"]),
  participants: z.array(participant).min(1),
  expenseDate: z.coerce.date(),
  notes: z.string().trim().max(1000).optional(),
});
export const settlementSchema = z
  .object({
    fromUserId: objectId,
    toUserId: objectId,
    amountMinor: z.number().int().positive(),
    method: z.enum(["cash", "bank", "upi", "card", "other"]).default("upi"),
    note: z.string().trim().max(300).optional(),
    settledAt: z.coerce.date().optional(),
    status: z.enum(["pending", "completed"]).optional(),
  })
  .refine((value) => value.fromUserId !== value.toUserId, {
    message: "Choose two different members.",
  });
