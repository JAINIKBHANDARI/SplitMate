import { Schema, model } from 'mongoose';
const activitySchema = new Schema({ groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true }, actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, required: true }, message: { type: String, required: true }, meta: { type: Schema.Types.Mixed, default: {} } }, { timestamps: true });
activitySchema.index({ groupId: 1, createdAt: -1 });
export const Activity = model('Activity', activitySchema);
