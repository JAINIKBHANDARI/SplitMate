import { Schema, model, type InferSchemaType } from "mongoose";
const participantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shareMinor: { type: Number, required: true, min: 0 },
    weight: Number,
    percentage: Number,
    included: { type: Boolean, default: true },
  },
  { _id: false },
);
const expenseSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true },
    category: { type: String, required: true, default: "Other" },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitType: {
      type: String,
      enum: ["equal", "exact", "percentage", "shares"],
      required: true,
    },
    participants: { type: [participantSchema], required: true },
    expenseDate: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    receiptUrl: String,
    receiptAttachmentId: { type: Schema.Types.ObjectId, ref: "Attachment" },
    source: {
      type: String,
      enum: ["manual", "recurring"],
      default: "manual",
      index: true,
    },
    recurringExpenseId: { type: Schema.Types.ObjectId, ref: "RecurringExpense" },
    occurrenceDate: Date,
    occurrenceKey: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: Date,
  },
  { timestamps: true },
);
expenseSchema.index({ groupId: 1, expenseDate: -1 });
expenseSchema.index({ groupId: 1, category: 1 });
expenseSchema.index({ groupId: 1, paidBy: 1 });
expenseSchema.index(
  { recurringExpenseId: 1, occurrenceKey: 1 },
  { unique: true, sparse: true },
);
export type ExpenseDocument = InferSchemaType<typeof expenseSchema>;
export const Expense = model("Expense", expenseSchema);
