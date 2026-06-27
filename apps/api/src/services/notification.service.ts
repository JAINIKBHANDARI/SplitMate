import { Membership } from "../models/Membership.js";
import { Notification } from "../models/Notification.js";

export async function notifyUser(
  userId: string,
  payload: {
    groupId?: string;
    type: string;
    title: string;
    body: string;
    href?: string;
  },
) {
  return Notification.create({ userId, ...payload });
}

export async function notifyGroup(
  groupId: string,
  payload: {
    type: string;
    title: string;
    body: string;
    href?: string;
    excludeUserId?: string;
  },
) {
  const members = await Membership.find({
    groupId,
    status: "active",
    userId: { $exists: true },
  }).lean();
  const docs = members
    .map((member) => String(member.userId))
    .filter((userId) => userId !== payload.excludeUserId)
    .map((userId) => ({
      userId,
      groupId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      href: payload.href,
    }));
  if (!docs.length) return [];
  return Notification.insertMany(docs);
}
