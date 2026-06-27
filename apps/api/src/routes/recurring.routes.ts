import { Router } from "express";
import { runRecurringCron } from "../controllers/recurring.controller.js";

export const recurringRouter = Router();
recurringRouter.post("/generate", runRecurringCron);
