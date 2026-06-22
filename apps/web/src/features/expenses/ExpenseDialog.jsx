import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { money } from "../../lib/format";
import { Button, Modal } from "../../components/ui";
export function ExpenseDialog({ group, members, open, onClose }) {
  const people = members
    .filter((member) => member.status === "active" && member.userId)
    .map((member) => ({
      id: member.userId._id ?? member.userId.id,
      name: member.userId.name,
    }));
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState(people[0]?.id ?? "");
  const [splitType, setSplitType] = useState("equal");
  const [rows, setRows] = useState(() =>
    people.map((person) => ({
      userId: person.id,
      name: person.name,
      included: true,
      value: 1,
    })),
  );
  const [error, setError] = useState("");
  const client = useQueryClient();
  const active = rows.filter((row) => row.included);
  const minor = Math.round(Number(amount || 0) * 100);
  const shares = useMemo(() => {
    if (!minor || !active.length) return [];
    if (splitType === "equal") {
      const base = Math.floor(minor / active.length);
      return active.map((row, index) => ({
        ...row,
        share: base + (index < minor % active.length ? 1 : 0),
      }));
    }
    if (splitType === "exact")
      return active.map((row) => ({
        ...row,
        share: Math.round(row.value * 100),
      }));
    const total = active.reduce((sum, row) => sum + row.value, 0);
    return active.map((row) => ({
      ...row,
      share: total ? Math.round((minor * row.value) / total) : 0,
    }));
  }, [minor, active, splitType]);
  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/groups/${group._id}/expenses`, {
        title,
        amountMinor: minor,
        category,
        paidBy,
        splitType,
        expenseDate: new Date(),
        participants: rows.map((row) => ({
          userId: row.userId,
          included: row.included,
          ...(splitType === "exact"
            ? { shareMinor: Math.round(row.value * 100) }
            : splitType === "percentage"
              ? { percentage: row.value }
              : splitType === "shares"
                ? { weight: row.value }
                : {}),
        })),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["group", group._id] });
      client.invalidateQueries({ queryKey: ["expenses", group._id] });
      client.invalidateQueries({ queryKey: ["balances", group._id] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
      setTitle("");
      setAmount("");
    },
    onError: (issue) =>
      setError(
        issue instanceof ApiError ? issue.message : "Could not save expense.",
      ),
  });
  const change = (id, update) =>
    setRows((current) =>
      current.map((row) => (row.userId === id ? { ...row, ...update } : row)),
    );
  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          if (!title || minor <= 0 || !paidBy)
            return setError("Add a title, amount, and payer.");
          mutation.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              What was it?
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
              placeholder="Dinner at Blue Tokai"
              autoFocus
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Amount</span>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm text-slate-400">
                ₹
              </span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="field pl-7"
                inputMode="decimal"
                placeholder="0.00"
              />
            </div>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Paid by</span>
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="field"
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field"
            >
              {[
                "Food",
                "Travel",
                "Home",
                "Utilities",
                "Entertainment",
                "Shopping",
                "Health",
                "Other",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <span className="mb-2 block text-sm font-semibold">Split</span>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {["equal", "exact", "percentage", "shares"].map((type) => (
              <button
                type="button"
                onClick={() => setSplitType(type)}
                key={type}
                className={`rounded-lg px-2 py-2 text-xs font-semibold capitalize ${splitType === type ? "bg-white text-violet shadow-sm dark:bg-white/15 dark:text-white" : "text-slate-500"}`}
              >
                {type === "shares" ? "Shares" : type}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Split with</span>
            <span className="text-xs text-slate-500">
              {active.length} people
            </span>
          </div>
          {rows.map((row) => (
            <div key={row.userId} className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => change(row.userId, { included: !row.included })}
                className={`grid size-5 place-items-center rounded-md border ${row.included ? "border-violet bg-violet text-white" : "bg-transparent"}`}
              >
                {row.included && <Check className="size-3" />}
              </button>
              <span className="flex-1 text-sm font-medium">{row.name}</span>
              {splitType !== "equal" && (
                <input
                  disabled={!row.included}
                  value={row.value}
                  onChange={(event) =>
                    change(row.userId, { value: Number(event.target.value) })
                  }
                  type="number"
                  min="0"
                  step={splitType === "exact" ? ".01" : ".01"}
                  className="w-20 rounded-lg border bg-transparent px-2 py-1 text-right text-sm"
                />
              )}
              <span className="w-20 text-right text-sm font-semibold">
                {money(
                  shares.find((share) => share.userId === row.userId)?.share ??
                    0,
                  group.currency,
                )}
              </span>
            </div>
          ))}
        </div>
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} type="submit">
            Add expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
