import { Schema, model, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    type: { type: String, required: true, maxlength: 80 },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 300 },
    href: { type: String, maxlength: 300 },
    readAt: Date,
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ groupId: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const Notification = model("Notification", notificationSchema);
