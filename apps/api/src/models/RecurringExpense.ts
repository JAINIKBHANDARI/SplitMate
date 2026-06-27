import { Schema, model, type InferSchemaType } from "mongoose";

const recurringParticipantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    included: { type: Boolean, default: true },
    shareMinor: Number,
    percentage: Number,
    weight: Number,
  },
  { _id: false },
);

const recurringExpenseSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true },
    category: { type: String, required: true, default: "Utilities" },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitType: {
      type: String,
      enum: ["equal", "exact", "percentage", "shares"],
      required: true,
    },
    participants: { type: [recurringParticipantSchema], required: true },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "custom"],
      required: true,
    },
    interval: { type: Number, min: 1, default: 1 },
    startDate: { type: Date, required: true },
    endDate: Date,
    nextOccurrenceDate: { type: Date, required: true, index: true },
    reminderDaysBefore: { type: Number, min: 0, max: 30, default: 1 },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

recurringExpenseSchema.index({ groupId: 1, status: 1, nextOccurrenceDate: 1 });
recurringExpenseSchema.index({ nextOccurrenceDate: 1, status: 1 });

export type RecurringExpenseDocument = InferSchemaType<
  typeof recurringExpenseSchema
>;
export const RecurringExpense = model(
  "RecurringExpense",
  recurringExpenseSchema,
);
