import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.js";
export const dashboardRouter = Router();
dashboardRouter.get("/", requireAuth, dashboard);
dashboardRouter.get("/analytics", requireAuth, dashboard);
