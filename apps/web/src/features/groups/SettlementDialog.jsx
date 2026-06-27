import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { fieldErrorsFrom, focusFirstInvalid } from "../../lib/formErrors";
import { Button, Modal } from "../../components/ui";
export function SettlementDialog({
  group,
  members,
  open,
  onClose,
  fromUserId,
  toUserId,
  amountMinor,
}) {
  const people = members
    .filter((member) => member.status === "active" && member.userId)
    .map((member) => ({
      id: member.userId._id ?? member.userId.id,
      name: member.userId.name,
    }));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [created, setCreated] = useState(null);
  const client = useQueryClient();
  const refresh = () => {
    ["balances", "group", "dashboard", "settlements"].forEach((key) =>
      client.invalidateQueries({ queryKey: [key, group._id] }),
    );
  };
  const mutation = useMutation({
    mutationFn: (body) => api.post(`/groups/${group._id}/settlements`, body),
    onSuccess: (data) => {
      refresh();
      setCreated(data.settlement);
    },
    onError: (issue) => {
      const nextFieldErrors =
        issue instanceof ApiError ? fieldErrorsFrom(issue) : {};
      setFieldErrors(nextFieldErrors);
      setError(
        issue instanceof ApiError
          ? issue.message
          : "Could not record settlement.",
      );
    },
  });
  const markSent = useMutation({
    mutationFn: (id) =>
      api.patch(`/groups/${group._id}/settlements/${id}`, { status: "sent" }),
    onSuccess: (data) => {
      refresh();
      setCreated(data.settlement);
    },
  });
  return (
    <Modal
      open={open}
      onClose={() => {
        setCreated(null);
        setError("");
        setFieldErrors({});
        onClose();
      }}
      title="Settle up"
    >
      {created ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-mint/10 p-4 text-sm text-mint">
            Settlement created as {created.status}. The receiver must confirm
            before balances change.
          </p>
          {created.upiLink && (
            <a className="inline-flex text-sm font-bold text-violet" href={created.upiLink}>
              Open UPI app
            </a>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              loading={markSent.isPending}
              onClick={() => markSent.mutate(created._id)}
              disabled={created.status === "sent"}
            >
              Mark sent
            </Button>
          </div>
        </div>
      ) : (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const fromUserId = String(form.get("fromUserId")),
            toUserId = String(form.get("toUserId"));
          const amountMinor = Math.round(Number(form.get("amount")) * 100);
          const localErrors = {};
          if (!fromUserId) localErrors.fromUserId = "Choose who is paying.";
          if (!toUserId) localErrors.toUserId = "Choose who receives.";
          if (fromUserId === toUserId)
            localErrors.toUserId = "Choose two different members.";
          if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0)
            localErrors.amount = "Amount must be greater than zero.";
          if (Object.keys(localErrors).length) {
            setFieldErrors(localErrors);
            setError("Validation failed");
            focusFirstInvalid(event.currentTarget, localErrors);
            return;
          }
          setFieldErrors({});
          setError("");
          mutation.mutate({
            fromUserId,
            toUserId,
            amountMinor,
            method: form.get("method"),
            transactionRef: form.get("transactionRef"),
            note: form.get("note"),
            status: "pending",
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">From</span>
            <select
              name="fromUserId"
              defaultValue={fromUserId}
              className={`field ${fieldErrors.fromUserId ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(fieldErrors.fromUserId)}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            {fieldErrors.fromUserId && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.fromUserId}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">To</span>
            <select
              name="toUserId"
              defaultValue={toUserId ?? people[1]?.id}
              className={`field ${fieldErrors.toUserId ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(fieldErrors.toUserId)}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            {fieldErrors.toUserId && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.toUserId}
              </small>
            )}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Amount</span>
            <input
              required
              name="amount"
              min="0.01"
              step="0.01"
              defaultValue={amountMinor ? amountMinor / 100 : ""}
              className={`field ${fieldErrors.amount || fieldErrors.amountMinor ? "border-rose-500" : ""}`}
              type="number"
              inputMode="decimal"
              aria-invalid={Boolean(fieldErrors.amount || fieldErrors.amountMinor)}
            />
            {(fieldErrors.amount || fieldErrors.amountMinor) && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {fieldErrors.amount || fieldErrors.amountMinor}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Method</span>
            <select name="method" className="field">
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            Transaction reference{" "}
            <small className="font-normal text-slate-400">Optional</small>
          </span>
          <input name="transactionRef" className="field" placeholder="UPI ref no." />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            Note <small className="font-normal text-slate-400">Optional</small>
          </span>
          <input name="note" className="field" placeholder="Paid in full" />
        </label>
        {error && <p className="text-sm text-rose-600">{fieldErrors.form || error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending}>Record payment</Button>
        </div>
      </form>
      )}
    </Modal>
  );
}
