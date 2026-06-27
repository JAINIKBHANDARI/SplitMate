import { z } from "zod";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
const normalizedEmail = z
  .string({ required_error: "Email is required." })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(160, "Email is too long.");
const password = z
  .string({ required_error: "Password is required." })
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain 128 characters or fewer.");

export const signUpSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required." })
      .trim()
      .min(2, "Name is required.")
      .max(80, "Name is too long."),
    email: normalizedEmail,
    password,
    confirmPassword: z.string({
      required_error: "Confirm your password.",
    }),
    timezone: z.string().max(80, "Timezone is too long.").optional(),
    defaultCurrency: z
      .string()
      .length(3, "Choose a valid currency.")
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
  });
export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string({ required_error: "Password is required." }).min(1, "Password is required."),
  remember: z.boolean().optional().default(false),
});
export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required.").max(80, "Group name is too long."),
  description: z.string().trim().max(240, "Description is too long.").optional(),
  currency: z.string().length(3).default("INR"),
  cover: z.string().max(30).optional(),
});
export const memberSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
});
export const guestMemberSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase())
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
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
  title: z.string().trim().min(1, "Description is required.").max(120, "Description is too long."),
  description: z.string().trim().max(500).optional(),
  amountMinor: z.number().int("Amount must be a whole minor unit.").positive("Amount must be greater than zero."),
  category: z.string().trim().min(1, "Category is required.").max(40),
  paidBy: objectId,
  splitType: z.enum(["equal", "exact", "percentage", "shares"]),
  participants: z.array(participant).min(1, "Select at least one participant."),
  expenseDate: z.coerce.date(),
  notes: z.string().trim().max(1000).optional(),
  recurring: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["weekly", "monthly", "custom"]),
      interval: z.number().int().positive().max(365).default(1),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      nextOccurrenceDate: z.coerce.date().optional(),
      reminderDaysBefore: z.number().int().min(0).max(30).default(1),
    })
    .optional(),
});
export const settlementSchema = z
  .object({
    fromUserId: objectId,
    toUserId: objectId,
    amountMinor: z.number().int().positive("Amount must be greater than zero."),
    method: z.enum(["cash", "bank", "upi", "card", "other"]).default("upi"),
    transactionRef: z.string().trim().max(120).optional(),
    note: z.string().trim().max(300).optional(),
    settledAt: z.coerce.date().optional(),
    status: z
      .enum(["suggested", "pending", "sent", "confirmed", "completed"])
      .optional(),
  })
  .refine((value) => value.fromUserId !== value.toUserId, {
    message: "Choose two different members.",
  });
export const settlementStatusSchema = z.object({
  status: z.enum(["pending", "sent", "confirmed", "cancelled", "rejected"]),
  transactionRef: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
});
export const recurringExpenseSchema = expenseSchema
  .omit({ recurring: true, expenseDate: true })
  .extend({
    frequency: z.enum(["weekly", "monthly", "custom"]),
    interval: z.number().int().positive().max(365).default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    nextOccurrenceDate: z.coerce.date().optional(),
    reminderDaysBefore: z.number().int().min(0).max(30).default(1),
  });
export const budgetSchema = z.object({
  scope: z.enum(["group", "category", "personal"]),
  category: z.string().trim().min(1).max(40).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amountMinor: z.number().int().positive("Amount must be greater than zero."),
  alertThresholds: z.array(z.number().positive().max(200)).optional(),
});
export const attachmentCaptionSchema = z.object({
  caption: z.string().trim().max(160).optional(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Reset token is invalid."),
    password,
    confirmPassword: z.string({
      required_error: "Confirm your password.",
    }),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: password,
    confirmPassword: z.string({
      required_error: "Confirm your password.",
    }),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
  });

export const forgotPasswordSchema = z.object({ email: normalizedEmail });
