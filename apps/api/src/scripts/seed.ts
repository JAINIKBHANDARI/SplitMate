import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { Expense } from "../models/Expense.js";
import { Settlement } from "../models/Settlement.js";
import { Activity } from "../models/Activity.js";
import { hashPassword } from "../services/auth.service.js";
import { calculateSplit } from "@splitmate/shared";

async function run() {
  await connectDatabase();
  await Promise.all([
    Activity.deleteMany({}),
    Settlement.deleteMany({}),
    Expense.deleteMany({}),
    Membership.deleteMany({}),
    Group.deleteMany({}),
    User.deleteMany({}),
  ]);
  const hash = await hashPassword("DemoPass123!");
  const [jainik, riya, arjun] = await User.create([
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
  await Settlement.create({
    groupId: goa._id,
    fromUserId: arjun._id,
    toUserId: jainik._id,
    amountMinor: 200000,
    currency: "INR",
    method: "upi",
    status: "completed",
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
