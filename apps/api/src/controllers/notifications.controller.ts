import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const notifications = await Notification.find({ userId: req.auth!.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  ok(res, {
    notifications,
    unreadCount: await Notification.countDocuments({
      userId: req.auth!.userId,
      readAt: { $exists: false },
    }),
  });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: String(req.params.notificationId), userId: req.auth!.userId },
    { readAt: new Date() },
  );
  ok(res, { read: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.auth!.userId, readAt: { $exists: false } },
    { readAt: new Date() },
  );
  ok(res, { read: true });
});
