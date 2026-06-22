import { Router } from "express";
import * as groups from "../controllers/groups.controller.js";
import * as expenses from "../controllers/expenses.controller.js";
import * as settlements from "../controllers/settlements.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  expenseSchema,
  groupSchema,
  memberSchema,
  roleSchema,
  settlementSchema,
} from "../validators/schemas.js";
export const groupsRouter = Router();
groupsRouter.use(requireAuth);
groupsRouter.get("/", groups.listGroups);
groupsRouter.post("/", validate(groupSchema), groups.createGroup);
groupsRouter.post("/join/:inviteCode", groups.joinGroup);
groupsRouter.get("/:groupId", groups.getGroup);
groupsRouter.patch(
  "/:groupId",
  validate(groupSchema.partial()),
  groups.updateGroup,
);
groupsRouter.post("/:groupId/archive", groups.archiveGroup);
groupsRouter.post(
  "/:groupId/members",
  validate(memberSchema),
  groups.inviteMember,
);
groupsRouter.patch(
  "/:groupId/members/:membershipId",
  validate(roleSchema),
  groups.updateRole,
);
groupsRouter.delete("/:groupId/members/:membershipId", groups.removeMember);
groupsRouter.get("/:groupId/expenses", expenses.listExpenses);
groupsRouter.post(
  "/:groupId/expenses",
  validate(expenseSchema),
  expenses.createExpense,
);
groupsRouter.patch(
  "/:groupId/expenses/:expenseId",
  validate(expenseSchema.partial()),
  expenses.updateExpense,
);
groupsRouter.delete("/:groupId/expenses/:expenseId", expenses.deleteExpense);
groupsRouter.get("/:groupId/balances", settlements.balances);
groupsRouter.get("/:groupId/settlements", settlements.listSettlements);
groupsRouter.post(
  "/:groupId/settlements",
  validate(settlementSchema),
  settlements.createSettlement,
);
groupsRouter.patch(
  "/:groupId/settlements/:settlementId",
  settlements.updateSettlement,
);
groupsRouter.get("/:groupId/activity", requireAuth, async (req, res, next) => {
  try {
    const { membershipFor } = await import("../services/access.service.js");
    const { Activity } = await import("../models/Activity.js");
    const { ok } = await import("../lib/http.js");
    const id = String(req.params.groupId);
    await membershipFor(req, id);
    ok(res, {
      activity: await Activity.find({ groupId: id })
        .populate("actorId", "name avatarColor")
        .sort({ createdAt: -1 })
        .limit(100),
    });
  } catch (error) {
    next(error);
  }
});
