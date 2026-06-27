import { useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Archive,
  ArrowRight,
  BarChart3,
  CalendarClock,
  Copy,
  CreditCard,
  Plus,
  ReceiptText,
  Settings,
  Trash2,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { dateLabel, money, relativeTime } from "../lib/format";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Metric,
  Modal,
  Skeleton,
} from "../components/ui";
import { ExpenseDialog } from "../features/expenses/ExpenseDialog";
import { SettlementDialog } from "../features/groups/SettlementDialog";
const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "expenses", label: "Expenses", icon: ReceiptText },
  { key: "balances", label: "Balances", icon: CreditCard },
  { key: "recurring", label: "Recurring", icon: CalendarClock },
  { key: "budgets", label: "Budgets", icon: WalletCards },
  { key: "members", label: "Members", icon: Users },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
];
export default function GroupDetail() {
  const { groupId = "" } = useParams();
  const location = useLocation();
  const lastSegment = location.pathname.split("/").filter(Boolean).at(-1);
  const tab = !lastSegment || lastSegment === groupId ? "overview" : lastSegment;
  const { data, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => api.get(`/groups/${groupId}`),
  });
  const expenses = useQuery({
    queryKey: ["expenses", groupId],
    queryFn: () => api.get(`/groups/${groupId}/expenses`),
  });
  const balanceQuery = useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => api.get(`/groups/${groupId}/balances`),
  });
  const activity = useQuery({
    queryKey: ["activity", groupId],
    queryFn: () => api.get(`/groups/${groupId}/activity`),
  });
  const recurring = useQuery({
    queryKey: ["recurring", groupId],
    queryFn: () => api.get(`/groups/${groupId}/recurring`),
  });
  const budgets = useQuery({
    queryKey: ["budgets", groupId],
    queryFn: () => api.get(`/groups/${groupId}/budgets`),
  });
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [settle, setSettle] = useState(null);
  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-52" />
      </div>
    );
  if (!data) return <Navigate to="/app/groups" replace />;
  const group = data.group,
    balance = balanceQuery.data ?? data.balances;
  const people = new Map(
    data.members
      .filter((member) => member.userId)
      .map((member) => [member.userId._id ?? member.userId.id, member.userId]),
  );
  const link = (key) =>
    key === "overview"
      ? `/app/groups/${groupId}`
      : `/app/groups/${groupId}/${key}`;
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet to-[#4e43b7] p-5 text-white shadow-float sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/app/groups"
              className="text-xs font-semibold text-white/65 hover:text-white"
            >
              Groups /
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              {group.name}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {group.description || "Shared, sorted."}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setExpenseOpen(true)}
            disabled={group.archived}
            className="bg-white text-violet hover:bg-white/90"
          >
            <Plus className="size-4" />
            Add expense
          </Button>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm">
          <span>
            <b className="block text-lg">
              {money(balance.totalSpentMinor, group.currency)}
            </b>
            <small className="text-white/65">Total spend</small>
          </span>
          <span>
            <b className="block text-lg">
              {
                data.members.filter((member) => member.status === "active")
                  .length
              }
            </b>
            <small className="text-white/65">Members</small>
          </span>
          {group.archived && (
            <span className="rounded-lg bg-white/15 px-2 py-1 text-xs font-bold">
              Archived
            </span>
          )}
        </div>
      </section>
      <div className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={link(key)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${tab === key ? "border-violet text-violet" : "border-transparent text-slate-500 hover:text-violet"}`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
      {tab === "overview" && (
        <Overview
          group={group}
          balance={balance}
          expenses={expenses.data?.expenses ?? []}
          people={people}
          onSettle={setSettle}
          onExpense={() => setExpenseOpen(true)}
        />
      )}{" "}
      {tab === "expenses" && (
        <Expenses
          group={group}
          expenses={expenses.data?.expenses ?? []}
          loading={expenses.isLoading}
          onAdd={() => setExpenseOpen(true)}
        />
      )}{" "}
      {tab === "balances" && (
        <Balances
          group={group}
          balance={balance}
          people={people}
          onSettle={setSettle}
        />
      )}{" "}
      {tab === "recurring" && (
        <RecurringRules
          group={group}
          members={data.members}
          rows={recurring.data?.recurring ?? []}
        />
      )}{" "}
      {tab === "budgets" && (
        <Budgets group={group} rows={budgets.data?.budgets ?? []} />
      )}{" "}
      {tab === "members" && <Members group={group} members={data.members} />}{" "}
      {tab === "activity" && (
        <ActivityList rows={activity.data?.activity ?? []} />
      )}{" "}
      {tab === "settings" && <SettingsPanel group={group} />}
      <ExpenseDialog
        group={group}
        members={data.members}
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
      />
      <SettlementDialog
        group={group}
        members={data.members}
        open={!!settle}
        onClose={() => setSettle(null)}
        {...settle}
      />
    </div>
  );
}
function Overview({ group, balance, expenses, people, onSettle, onExpense }) {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric
          label="Total spend"
          value={money(balance.totalSpentMinor, group.currency)}
        />
        <Metric
          label="Owed"
          value={money(
            balance.balances
              .filter((item) => item.amountMinor > 0)
              .reduce((sum, item) => sum + item.amountMinor, 0),
            group.currency,
          )}
          tone="positive"
        />
        <Metric
          label="To settle"
          value={`${balance.suggestions.length} payments`}
        />
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold">Recent expenses</p>
              <p className="text-xs text-slate-500">The latest additions.</p>
            </div>
            <Button variant="ghost" onClick={onExpense}>
              Add
            </Button>
          </div>
          {expenses.slice(0, 5).map((expense) => (
            <div
              className="flex items-center gap-3 border-t px-5 py-3"
              key={expense._id}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-violet/10 text-xs font-bold text-violet">
                {expense.category[0]}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{expense.title}</b>
                <small className="text-xs text-slate-500">
                  Paid by {expense.paidBy?.name} ·{" "}
                  {dateLabel(expense.expenseDate)}
                </small>
              </span>
              <b className="text-sm">
                {money(expense.amountMinor, group.currency)}
              </b>
            </div>
          ))}
          {!expenses.length && (
            <p className="p-5 text-sm text-slate-500">No expenses yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Settle up</p>
              <p className="text-xs text-slate-500">Fewest payments.</p>
            </div>
            <CreditCard className="size-5 text-violet" />
          </div>
          <div className="mt-4 space-y-3">
            {balance.suggestions.slice(0, 4).map((item) => (
              <button
                key={`${item.fromUserId}${item.toUserId}`}
                onClick={() => onSettle(item)}
                className="flex w-full items-center gap-2 rounded-xl bg-violet/5 p-3 text-left transition hover:bg-violet/10"
              >
                <Avatar user={people.get(item.fromUserId)} size="sm" />
                <span className="min-w-0 flex-1 text-sm">
                  <b>{people.get(item.fromUserId)?.name}</b>
                  <span className="mx-1 text-slate-400">→</span>
                  <b>{people.get(item.toUserId)?.name}</b>
                </span>
                <strong className="text-sm text-violet">
                  {money(item.amountMinor, group.currency)}
                </strong>
              </button>
            ))}
            {!balance.suggestions.length && (
              <p className="rounded-xl bg-mint/10 p-4 text-sm font-medium text-mint">
                All settled up.
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
function Expenses({ group, expenses, loading, onAdd }) {
  const [search, setSearch] = useState("");
  const filtered = expenses.filter((expense) =>
    expense.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field max-w-sm"
          placeholder="Search expenses"
        />
        <Button onClick={onAdd}>
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-64" />
      ) : !filtered.length ? (
        <Empty
          icon={<ReceiptText />}
          title={search ? "No matching expenses" : "No expenses yet"}
          action={
            !search ? (
              <Button onClick={onAdd}>Add the first one</Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_9rem_8rem_7rem] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Expense</span>
            <span>Paid by</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>
          {filtered.map((expense) => (
            <div
              key={expense._id}
              className="grid gap-2 border-b px-4 py-4 last:border-0 sm:grid-cols-[1fr_9rem_8rem_7rem] sm:items-center sm:gap-4 sm:px-5"
            >
              <span>
                <b className="block text-sm">{expense.title}</b>
                <small className="text-xs text-slate-500">
                  {expense.category} · {expense.splitType} split
                </small>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {expense.paidBy?.name}
              </span>
              <span className="text-sm text-slate-500">
                {dateLabel(expense.expenseDate)}
              </span>
              <b className="text-right text-sm">
                {money(expense.amountMinor, group.currency)}
              </b>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
function Balances({ group, balance, people, onSettle }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
      <Card className="overflow-hidden">
        <div className="p-5">
          <p className="font-bold">Member balances</p>
          <p className="text-xs text-slate-500">Live after every change.</p>
        </div>
        {balance.balances.map((item) => (
          <div
            className="flex items-center gap-3 border-t px-5 py-4"
            key={item.userId}
          >
            <Avatar user={people.get(item.userId)} />
            <span className="flex-1">
              <b className="block text-sm">{people.get(item.userId)?.name}</b>
              <small
                className={item.amountMinor >= 0 ? "text-mint" : "text-coral"}
              >
                {item.amountMinor >= 0 ? "is owed" : "owes"}
              </small>
            </span>
            <b className={item.amountMinor >= 0 ? "text-mint" : "text-coral"}>
              {money(Math.abs(item.amountMinor), group.currency)}
            </b>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">Suggested payments</p>
            <p className="text-xs text-slate-500">
              Fewer transfers, same result.
            </p>
          </div>
          <Button variant="secondary" onClick={() => onSettle({})}>
            Manual
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {balance.suggestions.map((item) => (
            <button
              onClick={() => onSettle(item)}
              key={`${item.fromUserId}-${item.toUserId}`}
              className="flex w-full items-center gap-2 rounded-xl border p-3 text-left hover:border-violet"
            >
              <span className="flex-1 text-sm">
                <b>{people.get(item.fromUserId)?.name}</b> pays{" "}
                <b>{people.get(item.toUserId)?.name}</b>
              </span>
              <strong className="text-violet">
                {money(item.amountMinor, group.currency)}
              </strong>
              <ArrowRight className="size-4 text-slate-400" />
            </button>
          ))}
          {!balance.suggestions.length && (
            <p className="rounded-xl bg-mint/10 p-4 text-sm font-semibold text-mint">
              Everyone is settled.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
function RecurringRules({ group, members, rows }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const people = members
    .filter((member) => member.status === "active" && member.userId)
    .map((member) => ({
      id: member.userId._id ?? member.userId.id,
      name: member.userId.name,
    }));
  const invalidate = () => {
    client.invalidateQueries({ queryKey: ["recurring", group._id] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const save = useMutation({
    mutationFn: (body) => api.post(`/groups/${group._id}/recurring`, body),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const patch = useMutation({
    mutationFn: ({ id, body }) =>
      api.patch(`/groups/${group._id}/recurring/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/groups/${group._id}/recurring/${id}`),
    onSuccess: invalidate,
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">Recurring expenses</p>
          <p className="text-sm text-slate-500">
            Rent, utilities, subscriptions, and reminders.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New rule
        </Button>
      </div>
      {!rows.length ? (
        <Empty
          icon={<CalendarClock />}
          title="No recurring expenses"
          description="Create a rule for bills that repeat."
          action={<Button onClick={() => setOpen(true)}>Create rule</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          {rows.map((rule) => (
            <div
              key={rule._id}
              className="grid gap-3 border-b p-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-sm">{rule.title}</b>
                  <span className="rounded-full bg-violet/10 px-2 py-1 text-[10px] font-bold uppercase text-violet">
                    {rule.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {money(rule.amountMinor, group.currency)} · {rule.frequency}
                  {rule.interval > 1 ? ` every ${rule.interval}` : ""} · next{" "}
                  {dateLabel(rule.nextOccurrenceDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    patch.mutate({
                      id: rule._id,
                      body: {
                        status: rule.status === "paused" ? "active" : "paused",
                      },
                    })
                  }
                >
                  {rule.status === "paused" ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Delete ${rule.title}`}
                  onClick={() => remove.mutate(rule._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Recurring bill">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const amountMinor = Math.round(Number(form.get("amount")) * 100);
            const paidBy = String(form.get("paidBy"));
            save.mutate({
              title: form.get("title"),
              amountMinor,
              category: form.get("category"),
              paidBy,
              splitType: "equal",
              participants: people.map((person) => ({
                userId: person.id,
                included: true,
              })),
              frequency: form.get("frequency"),
              interval: Number(form.get("interval")) || 1,
              startDate: form.get("startDate"),
              reminderDaysBefore: Number(form.get("reminderDaysBefore")) || 1,
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Title</span>
              <input name="title" required className="field" />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Amount</span>
              <input
                name="amount"
                required
                min="0.01"
                step="0.01"
                type="number"
                className="field"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Paid by</span>
              <select name="paidBy" className="field">
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Category</span>
              <select name="category" className="field" defaultValue="Utilities">
                {["Home", "Utilities", "Entertainment", "Food", "Other"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Frequency</span>
              <select name="frequency" className="field" defaultValue="monthly">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom days</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Interval</span>
              <input name="interval" type="number" min="1" defaultValue="1" className="field" />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Remind</span>
              <input name="reminderDaysBefore" type="number" min="0" defaultValue="1" className="field" />
            </label>
          </div>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Start date</span>
            <input
              name="startDate"
              type="date"
              required
              className="field"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={save.isPending}>Save rule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
function Budgets({ group, rows }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const month = new Date().toISOString().slice(0, 7);
  const invalidate = () => {
    client.invalidateQueries({ queryKey: ["budgets", group._id] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const save = useMutation({
    mutationFn: (body) => api.post(`/groups/${group._id}/budgets`, body),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/groups/${group._id}/budgets/${id}`),
    onSuccess: invalidate,
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">Budgets</p>
          <p className="text-sm text-slate-500">
            Track monthly group and category limits.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add budget
        </Button>
      </div>
      {!rows.length ? (
        <Empty
          icon={<WalletCards />}
          title="No budgets yet"
          description="Set a monthly target for the group or a category."
          action={<Button onClick={() => setOpen(true)}>Create budget</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.budget._id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {row.budget.category || "Group monthly budget"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {money(row.spentMinor, group.currency)} spent of{" "}
                    {money(row.amountMinor, group.currency)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  aria-label="Delete budget"
                  onClick={() => remove.mutate(row.budget._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    row.isOverBudget
                      ? "bg-coral"
                      : row.nearLimit
                        ? "bg-amber-500"
                        : "bg-mint"
                  }`}
                  style={{ width: `${Math.min(row.percentageUsed, 100)}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                <span>{row.percentageUsed}% used</span>
                <span>{row.daysRemaining} days left</span>
                <span className="text-right">
                  {row.crossedThreshold ? `${row.crossedThreshold}% alert` : "On track"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Budget">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            save.mutate({
              scope: form.get("category") ? "category" : "group",
              category: form.get("category") || undefined,
              month: form.get("month"),
              amountMinor: Math.round(Number(form.get("amount")) * 100),
            });
          }}
        >
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Month</span>
            <input name="month" type="month" defaultValue={month} className="field" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Amount</span>
            <input name="amount" required type="number" min="0.01" step="0.01" className="field" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Category <small className="font-normal text-slate-400">Optional</small>
            </span>
            <input name="category" className="field" placeholder="Food" />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={save.isPending}>Save budget</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
function Members({ group, members }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("invite");
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const invite = useMutation({
    mutationFn: (body) => api.post(`/groups/${group._id}/members`, body),
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: ["group", group._id] });
      setInviteUrl(data.inviteUrl);
    },
    onError: (issue) =>
      setError(
        issue instanceof ApiError ? issue.message : "Could not invite member.",
      ),
  });
  const guest = useMutation({
    mutationFn: (body) => api.post(`/groups/${group._id}/members/guest`, body),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["group", group._id] });
      client.invalidateQueries({ queryKey: ["balances", group._id] });
      setOpen(false);
    },
    onError: (issue) =>
      setError(
        issue instanceof ApiError ? issue.message : "Could not add guest.",
      ),
  });
  const inviteLink = `${location.origin}/app/groups/join/${group.inviteCode}`;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="font-bold">Members</p>
            <p className="text-xs text-slate-500">Everyone in this group.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setMode("invite");
              setOpen(true);
            }}
          >
            <UserPlus className="size-4" />
            Invite
          </Button>
        </div>
        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center gap-3 border-t px-5 py-4"
          >
            <Avatar user={member.userId ?? { name: member.email }} />
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm">
                {member.userId?.name ?? member.displayName ?? member.email}
              </b>
              <small className="text-xs text-slate-500">
                {member.memberType === "guest"
                  ? member.email || member.phone || "Guest"
                  : member.userId?.email ?? member.email}
              </small>
            </span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${member.status === "invited" ? "bg-amber-100 text-amber-700" : "bg-violet/10 text-violet"}`}
            >
              {member.memberType === "guest"
                ? "Guest"
                : member.status === "invited"
                  ? "Invited"
                  : member.role}
            </span>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <p className="font-bold">Invite link</p>
        <p className="mt-1 text-sm text-slate-500">
          Anyone with this link can join.
        </p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={inviteLink} className="field min-w-0" />
          <Button
            variant="secondary"
            onClick={() => navigator.clipboard?.writeText(inviteLink)}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => {
            setMode("guest");
            setOpen(true);
          }}
        >
          <UserPlus className="size-4" />
          Add guest
        </Button>
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setError("");
          setInviteUrl("");
        }}
        title={mode === "guest" ? "Add guest" : "Invite a member"}
      >
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {["invite", "guest"].map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => {
                setMode(choice);
                setError("");
                setInviteUrl("");
              }}
              className={`rounded-lg px-2 py-2 text-sm font-semibold capitalize ${
                mode === choice
                  ? "bg-white text-violet shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-slate-500"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setInviteUrl("");
            const form = new FormData(event.currentTarget);
            if (mode === "guest")
              guest.mutate({
                name: form.get("name"),
                email: form.get("email"),
                phone: form.get("phone"),
              });
            else invite.mutate({ email: form.get("email") });
          }}
          className="space-y-4"
        >
          {mode === "guest" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Name</span>
              <input
                name="name"
                required
                className="field"
                placeholder="Aarav"
                autoFocus
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input
              name="email"
              required={mode === "invite"}
              type="email"
              className="field"
              placeholder="friend@example.com"
              autoFocus={mode === "invite"}
            />
          </label>
          {mode === "guest" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                Phone <small className="font-normal text-slate-400">Optional</small>
              </span>
              <input name="phone" className="field" placeholder="+91..." />
            </label>
          )}
          <p className="text-sm text-slate-500">
            {mode === "guest"
              ? "Guests can split expenses now and claim their profile later."
              : "Existing users join right away. New people get a secure invite link."}
          </p>
          {inviteUrl && (
            <div className="rounded-xl bg-mint/10 p-3 text-sm text-mint">
              Invite created.{" "}
              <button
                type="button"
                className="font-bold underline"
                onClick={() => navigator.clipboard?.writeText(inviteUrl)}
              >
                Copy link
              </button>
            </div>
          )}
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button loading={invite.isPending || guest.isPending}>
              {mode === "guest" ? "Add guest" : "Send invite"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
function ActivityList({ rows }) {
  return !rows.length ? (
    <Empty icon={<Activity />} title="No activity yet" />
  ) : (
    <Card className="overflow-hidden">
      {rows.map((row) => (
        <div key={row._id} className="flex gap-3 border-b p-5 last:border-0">
          <Avatar user={row.actorId} />
          <div>
            <p className="text-sm">
              <b>{row.actorId?.name ?? "Someone"}</b>{" "}
              <span className="text-slate-500">{row.message}</span>
            </p>
            <small className="mt-1 block text-xs text-slate-400">
              {relativeTime(row.createdAt)}
            </small>
          </div>
        </div>
      ))}
    </Card>
  );
}
function SettingsPanel({ group }) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body) => api.patch(`/groups/${group._id}`, body),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["group", group._id] });
      client.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (issue) =>
      setError(
        issue instanceof ApiError ? issue.message : "Could not update group.",
      ),
  });
  const archive = useMutation({
    mutationFn: () =>
      api.post(`/groups/${group._id}/archive`, { archived: !group.archived }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["group", group._id] }),
  });
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]">
      <Card className="p-5">
        <p className="font-bold">Group details</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            mutation.mutate({
              name: form.get("name"),
              description: form.get("description"),
            });
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Name</span>
            <input name="name" className="field" defaultValue={group.name} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              Description
            </span>
            <input
              name="description"
              className="field"
              defaultValue={group.description}
            />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button loading={mutation.isPending}>Save changes</Button>
        </form>
      </Card>
      <Card className="border-rose-200 p-5 dark:border-rose-500/20">
        <Archive className="size-5 text-rose-500" />
        <p className="mt-3 font-bold">
          {group.archived ? "Restore group" : "Archive group"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {group.archived
            ? "Bring this group back to life."
            : "Archived groups become read-only."}
        </p>
        <Button
          variant="danger"
          loading={archive.isPending}
          onClick={() => archive.mutate()}
          className="mt-4"
        >
          {group.archived ? "Restore group" : "Archive group"}
        </Button>
      </Card>
    </div>
  );
}
