import { Schema, model, type InferSchemaType } from "mongoose";

const invitationSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, trim: true, lowercase: true },
    tokenHash: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "revoked", "expired"],
      default: "pending",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true },
);

invitationSchema.index({ groupId: 1, status: 1, createdAt: -1 });
invitationSchema.index({ email: 1, status: 1 });

export type InvitationDocument = InferSchemaType<typeof invitationSchema>;
export const Invitation = model("Invitation", invitationSchema);
