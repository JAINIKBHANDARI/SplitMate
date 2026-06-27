import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { Expense } from "../models/Expense.js";
import { Settlement } from "../models/Settlement.js";
import { Activity } from "../models/Activity.js";
import { Budget } from "../models/Budget.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { Invitation } from "../models/Invitation.js";
import { Attachment } from "../models/Attachment.js";
import { Notification } from "../models/Notification.js";
import { hashPassword } from "../services/auth.service.js";
import { calculateSplit } from "@splitmate/shared";

async function run() {
  await connectDatabase();
  await Promise.all([
    Activity.deleteMany({}),
    Notification.deleteMany({}),
    Attachment.deleteMany({}),
    Invitation.deleteMany({}),
    RecurringExpense.deleteMany({}),
    Budget.deleteMany({}),
    Settlement.deleteMany({}),
    Expense.deleteMany({}),
    Membership.deleteMany({}),
    Group.deleteMany({}),
    User.deleteMany({}),
  ]);
  const hash = await hashPassword("DemoPass123!");
  const [jainik, riya, arjun, guest] = await User.create([
    {
      name: "Jainik Shah",
      email: "demo@splitmate.app",
      passwordHash: hash,
      avatarColor: "#6d5dfc",
      defaultCurrency: "INR",
    },
    {
      name: "Riya Mehta",
      email: "riya@example.com",
      passwordHash: hash,
      avatarColor: "#137a6c",
      defaultCurrency: "INR",
    },
    {
      name: "Arjun Patel",
      email: "arjun@example.com",
      passwordHash: hash,
      avatarColor: "#bf5b2d",
      defaultCurrency: "INR",
    },
    {
      name: "Neha Guest",
      email: "neha.guest@example.com",
      passwordHash: hash,
      avatarColor: "#64748b",
      defaultCurrency: "INR",
      isGuest: true,
    },
  ]);
  const [goa, flat] = await Group.create([
    {
      name: "Goa escape",
      description: "Sunsets, scooters, seafood.",
      cover: "orange",
      currency: "INR",
      createdBy: jainik._id,
      inviteCode: "goa-2026",
    },
    {
      name: "The flat",
      description: "The everyday bits.",
      cover: "indigo",
      currency: "INR",
      createdBy: jainik._id,
      inviteCode: "flat-2026",
    },
  ]);
  await Membership.create([
    { groupId: goa._id, userId: jainik._id, role: "owner" },
    { groupId: goa._id, userId: riya._id },
    { groupId: goa._id, userId: arjun._id },
    { groupId: flat._id, userId: jainik._id, role: "owner" },
    { groupId: flat._id, userId: riya._id },
    {
      groupId: flat._id,
      userId: guest._id,
      email: "neha.guest@example.com",
      displayName: "Neha Guest",
      memberType: "guest",
    },
  ]);
  const makeExpense = async (
    groupId: unknown,
    title: string,
    amountMinor: number,
    category: string,
    paidBy: any,
    users: any[],
    daysAgo: number,
    splitType: "equal" | "percentage" = "equal",
  ) =>
    Expense.create({
      groupId,
      title,
      amountMinor,
      currency: "INR",
      category,
      paidBy: paidBy._id,
      splitType,
      participants: calculateSplit(
        amountMinor,
        splitType,
        users.map((user, index) => ({
          userId: String(user._id),
          included: true,
          percentage:
            splitType === "percentage"
              ? index === 0
                ? 50
                : 50 / (users.length - 1)
              : undefined,
        })),
      ),
      expenseDate: new Date(Date.now() - daysAgo * 86400000),
      createdBy: paidBy._id,
      updatedBy: paidBy._id,
    });
  await makeExpense(
    goa._id,
    "Beach villa",
    1860000,
    "Home",
    jainik,
    [jainik, riya, arjun],
    18,
  );
  await makeExpense(
    goa._id,
    "Seafood dinner",
    524000,
    "Food",
    riya,
    [jainik, riya, arjun],
    16,
  );
  await makeExpense(
    goa._id,
    "Scooter rental",
    360000,
    "Travel",
    arjun,
    [jainik, riya, arjun],
    15,
  );
  await makeExpense(
    flat._id,
    "Internet",
    119900,
    "Utilities",
    jainik,
    [jainik, riya],
    7,
  );
  await makeExpense(
    flat._id,
    "Groceries",
    324500,
    "Food",
    riya,
    [jainik, riya],
    2,
  );
  await RecurringExpense.create({
    groupId: flat._id,
    title: "Monthly rent",
    amountMinor: 6000000,
    currency: "INR",
    category: "Home",
    paidBy: jainik._id,
    splitType: "equal",
    participants: calculateSplit(
      6000000,
      "equal",
      [jainik, riya, guest].map((user) => ({
        userId: String(user._id),
        included: true,
      })),
    ),
    frequency: "monthly",
    interval: 1,
    startDate: new Date(),
    nextOccurrenceDate: new Date(Date.now() + 3 * 86400000),
    reminderDaysBefore: 2,
    createdBy: jainik._id,
    updatedBy: jainik._id,
  });
  await Budget.create({
    groupId: flat._id,
    scope: "group",
    month: new Date().toISOString().slice(0, 7),
    amountMinor: 12000000,
    currency: "INR",
    createdBy: jainik._id,
    updatedBy: jainik._id,
  });
  await Settlement.create({
    groupId: goa._id,
    fromUserId: arjun._id,
    toUserId: jainik._id,
    amountMinor: 200000,
    currency: "INR",
    method: "upi",
    status: "confirmed",
    requestedBy: arjun._id,
    confirmedBy: jainik._id,
    confirmedAt: new Date(),
    settledAt: new Date(),
  });
  await Activity.create([
    {
      groupId: goa._id,
      actorId: jainik._id,
      type: "group.created",
      message: "Created the group",
    },
    {
      groupId: goa._id,
      actorId: riya._id,
      type: "expense.created",
      message: "Added Seafood dinner",
    },
    {
      groupId: flat._id,
      actorId: riya._id,
      type: "expense.created",
      message: "Added Groceries",
    },
  ]);
  console.info("Seeded: demo@splitmate.app / DemoPass123!");
  process.exit(0);
}
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
