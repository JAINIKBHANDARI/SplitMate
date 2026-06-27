import { Schema, model, type InferSchemaType } from "mongoose";

const budgetSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    scope: {
      type: String,
      enum: ["group", "category", "personal"],
      required: true,
      index: true,
    },
    category: { type: String, trim: true, maxlength: 40 },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true, default: "INR" },
    alertThresholds: {
      type: [Number],
      default: [50, 75, 90, 100],
      validate: {
        validator: (values: number[]) =>
          values.every((value) => value > 0 && value <= 200),
        message: "Budget thresholds must be between 1 and 200.",
      },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

budgetSchema.index(
  { groupId: 1, userId: 1, scope: 1, category: 1, month: 1 },
  { unique: true },
);
budgetSchema.index({ groupId: 1, month: 1 });
budgetSchema.index({ userId: 1, month: 1 });

export type BudgetDocument = InferSchemaType<typeof budgetSchema>;
export const Budget = model("Budget", budgetSchema);
