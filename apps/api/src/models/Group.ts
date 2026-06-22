import { Schema, model, type InferSchemaType } from 'mongoose';
const groupSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 240, default: '' },
  cover: { type: String, default: 'violet' },
  currency: { type: String, required: true, uppercase: true, default: 'INR' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  inviteCode: { type: String, required: true, unique: true, index: true },
  archived: { type: Boolean, default: false, index: true }
}, { timestamps: true });
groupSchema.index({ createdBy: 1, archived: 1 });
export type GroupDocument = InferSchemaType<typeof groupSchema>;
export const Group = model('Group', groupSchema);
