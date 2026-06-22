import { Activity } from '../models/Activity.js';
export const recordActivity = (groupId: string, actorId: string, type: string, message: string, meta: Record<string, unknown> = {}) => Activity.create({ groupId, actorId, type, message, meta });
