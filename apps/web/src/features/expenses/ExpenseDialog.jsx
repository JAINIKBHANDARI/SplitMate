import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, Upload } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { fieldErrorsFrom, focusFirstInvalid } from "../../lib/formErrors";
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
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
        recurring: recurringEnabled
          ? {
              enabled: true,
              frequency: recurringFrequency,
              interval: 1,
              startDate: new Date(),
              reminderDaysBefore: 1,
            }
          : undefined,
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
    onSuccess: async (data) => {
      if (receiptFile && data?.expense?._id) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        formData.append("caption", "Receipt");
        await api.upload(
          `/attachments/expense/${data.expense._id}`,
          formData,
          (event) => {
            if (event.total)
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
          },
        );
      }
      client.invalidateQueries({ queryKey: ["group", group._id] });
      client.invalidateQueries({ queryKey: ["expenses", group._id] });
      client.invalidateQueries({ queryKey: ["balances", group._id] });
      client.invalidateQueries({ queryKey: ["recurring", group._id] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
      setTitle("");
      setAmount("");
      setReceiptFile(null);
      setUploadProgress(0);
      setRecurringEnabled(false);
      setFieldErrors({});
      setError("");
    },
    onError: (issue) => {
      const nextFieldErrors =
        issue instanceof ApiError ? fieldErrorsFrom(issue) : {};
      setFieldErrors(nextFieldErrors);
      setError(
        issue instanceof ApiError ? issue.message : "Could not save expense.",
      );
    },
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
          const localErrors = validateExpense({
            title,
            minor,
            paidBy,
            splitType,
            active,
            shares,
          });
          if (Object.keys(localErrors).length) {
            setFieldErrors(localErrors);
            setError(localErrors.form || "Validation failed");
            focusFirstInvalid(event.currentTarget, localErrors);
            return;
          }
          setFieldErrors({});
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
              name="title"
              className={`field ${fieldErrors.title ? "border-rose-500" : ""}`}
              placeholder="Dinner at Blue Tokai"
              autoFocus
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.title}
              </small>
            )}
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
                name="amount"
                className={`field pl-7 ${fieldErrors.amountMinor || fieldErrors.amount ? "border-rose-500" : ""}`}
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={Boolean(fieldErrors.amountMinor || fieldErrors.amount)}
              />
            </div>
            {(fieldErrors.amountMinor || fieldErrors.amount) && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.amountMinor || fieldErrors.amount}
              </small>
            )}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Paid by</span>
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              name="paidBy"
              className={`field ${fieldErrors.paidBy ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(fieldErrors.paidBy)}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            {fieldErrors.paidBy && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.paidBy}
              </small>
            )}
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
                  name={`split-${row.userId}`}
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
          {fieldErrors.participants && (
            <small className="mt-2 block text-sm text-rose-600">
              {fieldErrors.participants}
            </small>
          )}
        </div>
        <div className="grid gap-3 rounded-2xl border p-3">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={recurringEnabled}
              onChange={(event) => setRecurringEnabled(event.target.checked)}
            />
            <CalendarClock className="size-4 text-violet" />
            Make recurring
          </label>
          {recurringEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-semibold">
                  Frequency
                </span>
                <select
                  value={recurringFrequency}
                  onChange={(event) => setRecurringFrequency(event.target.value)}
                  className="field"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom days</option>
                </select>
              </label>
              <p className="self-end rounded-xl bg-violet/5 p-3 text-xs text-slate-500">
                Future occurrences will be generated by the server cron.
              </p>
            </div>
          )}
        </div>
        <label className="block rounded-2xl border p-3">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Upload className="size-4 text-violet" />
            Receipt or payment proof
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
            className="field"
          />
          {receiptFile && (
            <p className="mt-2 text-xs text-slate-500">
              {receiptFile.name}
              {uploadProgress ? ` - ${uploadProgress}% uploaded` : ""}
            </p>
          )}
        </label>
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">
            {fieldErrors.form || error}
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

function validateExpense({ title, minor, paidBy, splitType, active, shares }) {
  const errors = {};
  if (!title.trim()) errors.title = "Description is required.";
  if (!Number.isSafeInteger(minor) || minor <= 0)
    errors.amount = "Amount must be greater than zero.";
  if (!paidBy) errors.paidBy = "Choose who paid.";
  if (!active.length) errors.participants = "Select at least one participant.";
  const totalShare = shares.reduce((sum, row) => sum + row.share, 0);
  if (splitType === "exact" && totalShare !== minor)
    errors.participants = "Exact split amounts must equal the total expense.";
  const totalPercent = active.reduce((sum, row) => sum + Number(row.value || 0), 0);
  if (splitType === "percentage" && Math.abs(totalPercent - 100) > 0.0001)
    errors.participants = "Percentage split must total 100%.";
  if (
    splitType === "shares" &&
    active.some((row) => !Number.isFinite(row.value) || Number(row.value) <= 0)
  )
    errors.participants = "Shares must be positive.";
  return errors;
}
