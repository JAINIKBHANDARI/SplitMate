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
