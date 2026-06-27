import { Schema, model, type InferSchemaType } from "mongoose";
const membershipSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, lowercase: true, trim: true },
    displayName: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 30 },
    memberType: {
      type: String,
      enum: ["user", "guest"],
      default: "user",
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "invited", "removed"],
      default: "active",
      index: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    joinedAt: Date,
    removedAt: Date,
  },
  { timestamps: true },
);
membershipSchema.index(
  { groupId: 1, userId: 1 },
  { unique: true, sparse: true },
);
membershipSchema.index({ userId: 1, status: 1 });
membershipSchema.index({ groupId: 1, role: 1 });
export type MembershipDocument = InferSchemaType<typeof membershipSchema>;
export const Membership = model("Membership", membershipSchema);
