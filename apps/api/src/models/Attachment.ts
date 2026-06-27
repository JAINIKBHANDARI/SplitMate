import { Schema, model, type InferSchemaType } from "mongoose";

const attachmentSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    targetType: {
      type: String,
      enum: ["expense", "settlement"],
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, trim: true, maxlength: 160, default: "" },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageProvider: {
      type: String,
      enum: ["cloudinary"],
      default: "cloudinary",
    },
  },
  { timestamps: true },
);

attachmentSchema.index({ groupId: 1, createdAt: -1 });
attachmentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export type AttachmentDocument = InferSchemaType<typeof attachmentSchema>;
export const Attachment = model("Attachment", attachmentSchema);
