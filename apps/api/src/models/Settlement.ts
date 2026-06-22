import { Schema, model, type InferSchemaType } from 'mongoose';
const settlementSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountMinor: { type: Number, required: true, min: 1 }, currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed', index: true }, method: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'other'], default: 'upi' }, note: { type: String, trim: true, maxlength: 300, default: '' }, settledAt: { type: Date, default: Date.now }
}, { timestamps: true });
settlementSchema.index({ groupId: 1, status: 1 }); settlementSchema.index({ fromUserId: 1, toUserId: 1, groupId: 1 });
export type SettlementDocument = InferSchemaType<typeof settlementSchema>;
export const Settlement = model('Settlement', settlementSchema);
