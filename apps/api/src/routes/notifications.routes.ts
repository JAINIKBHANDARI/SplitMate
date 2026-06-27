import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as notifications from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.get("/", notifications.listNotifications);
notificationsRouter.patch("/:notificationId/read", notifications.markRead);
notificationsRouter.post("/mark-all-read", notifications.markAllRead);
