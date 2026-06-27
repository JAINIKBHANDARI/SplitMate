import { Schema, model, type InferSchemaType } from "mongoose";
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: String,
    avatarColor: { type: String, default: "#6d5dfc" },
    timezone: { type: String, default: "UTC" },
    defaultCurrency: { type: String, default: "INR", uppercase: true },
    upiId: { type: String, trim: true, lowercase: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 30 },
    isGuest: { type: Boolean, default: false, index: true },
    claimedAt: Date,
    notificationPreferences: {
      emailInvites: { type: Boolean, default: true },
      recurringReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      settlementUpdates: { type: Boolean, default: true },
    },
    onboardingComplete: { type: Boolean, default: false },
    lastSeenAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_d, ret) => {
        delete (ret as any).passwordHash;
        return ret;
      },
    },
  },
);
export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
