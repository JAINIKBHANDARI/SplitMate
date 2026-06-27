import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { fieldErrorsFrom, focusFirstInvalid } from "../lib/formErrors";
import { Avatar, Button, Card } from "../components/ui";
import { useAuth } from "../providers/auth";
import { useTheme } from "../providers/theme";
export default function Profile() {
  const { user, signOut } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const mutation = useMutation({
    mutationFn: (body) => api.patch("/users/me", body),
    onSuccess: (data) => {
      client.setQueryData(["auth", "me"], data);
      setProfileErrors({});
      setMessage("Saved.");
    },
    onError: (issue) => {
      const nextErrors = issue instanceof ApiError ? fieldErrorsFrom(issue) : {};
      setProfileErrors(nextErrors);
      setMessage(issue instanceof ApiError ? issue.message : "Could not save.");
    },
  });
  const password = useMutation({
    mutationFn: (body) => api.post("/auth/change-password", body),
    onSuccess: (data) => {
      client.setQueryData(["auth", "me"], data);
      setPasswordErrors({});
      setMessage("Password updated.");
    },
    onError: (issue) => {
      const nextErrors = issue instanceof ApiError ? fieldErrorsFrom(issue) : {};
      setPasswordErrors(nextErrors);
      setMessage(
        issue instanceof ApiError ? issue.message : "Could not update password.",
      );
    },
  });
  const logoutAll = useMutation({
    mutationFn: () => api.post("/auth/logout-all"),
    onSuccess: async () => {
      await signOut();
      navigate("/login");
    },
  });
  if (!user) return null;
  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Profile & preferences.
        </h1>
      </section>
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="lg" />
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const localErrors = {};
            if (!String(form.get("name") || "").trim())
              localErrors.name = "Name is required.";
            if (Object.keys(localErrors).length) {
              setProfileErrors(localErrors);
              focusFirstInvalid(event.currentTarget, localErrors);
              return;
            }
            setProfileErrors({});
            mutation.mutate({
              name: form.get("name"),
              timezone: form.get("timezone"),
              defaultCurrency: form.get("currency"),
              upiId: form.get("upiId"),
              phone: form.get("phone"),
              notificationPreferences: {
                emailInvites: Boolean(form.get("emailInvites")),
                recurringReminders: Boolean(form.get("recurringReminders")),
                budgetAlerts: Boolean(form.get("budgetAlerts")),
                settlementUpdates: Boolean(form.get("settlementUpdates")),
              },
            });
          }}
        >
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Name</span>
            <input
              className={`field ${profileErrors.name ? "border-rose-500" : ""}`}
              name="name"
              defaultValue={user.name}
              aria-invalid={Boolean(profileErrors.name)}
            />
            {profileErrors.name && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {profileErrors.name}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Currency</span>
            <select
              className="field"
              name="currency"
              defaultValue={user.defaultCurrency}
            >
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold">Timezone</span>
            <input
              className="field"
              name="timezone"
              defaultValue={
                user.timezone ||
                Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">UPI ID</span>
            <input className="field" name="upiId" defaultValue={user.upiId || ""} />
            {profileErrors.upiId && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {profileErrors.upiId}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Phone</span>
            <input className="field" name="phone" defaultValue={user.phone || ""} />
          </label>
          <div className="sm:col-span-2 grid gap-2 rounded-2xl border p-3 text-sm">
            <p className="font-semibold">Notifications</p>
            {[
              ["emailInvites", "Group invitations"],
              ["recurringReminders", "Recurring reminders"],
              ["budgetAlerts", "Budget alerts"],
              ["settlementUpdates", "Settlement updates"],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2">
                <input
                  name={name}
                  type="checkbox"
                  defaultChecked={user.notificationPreferences?.[name] !== false}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button loading={mutation.isPending}>Save profile</Button>
            {message && <span className="text-sm text-mint">{message}</span>}
          </div>
        </form>
      </Card>
      <Card className="p-5">
        <p className="font-bold">Appearance</p>
        <p className="mt-1 text-sm text-slate-500">
          Choose how SplitMate feels.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["light", "dark", "system"].map((choice) => (
            <button
              key={choice}
              onClick={() => setTheme(choice)}
              className={`rounded-xl border p-3 text-sm font-semibold capitalize ${theme === choice ? "border-violet bg-violet/10 text-violet" : "text-slate-500"}`}
            >
              {choice === "light" ? (
                <Sun className="mx-auto mb-1 size-4" />
              ) : choice === "dark" ? (
                <Moon className="mx-auto mb-1 size-4" />
              ) : (
                <UserRound className="mx-auto mb-1 size-4" />
              )}
              {choice}
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-violet" />
          <p className="font-bold">Security</p>
        </div>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const currentPassword = String(form.get("currentPassword") || "");
            const newPassword = String(form.get("newPassword") || "");
            const confirmPassword = String(form.get("confirmPassword") || "");
            const localErrors = {};
            if (!currentPassword)
              localErrors.currentPassword = "Current password is required.";
            if (newPassword.length < 8)
              localErrors.newPassword =
                "Password must contain at least 8 characters.";
            if (newPassword.length > 128)
              localErrors.newPassword =
                "Password must contain 128 characters or fewer.";
            if (newPassword !== confirmPassword)
              localErrors.confirmPassword = "Passwords do not match.";
            if (Object.keys(localErrors).length) {
              setPasswordErrors(localErrors);
              focusFirstInvalid(event.currentTarget, localErrors);
              return;
            }
            setPasswordErrors({});
            password.mutate({
              currentPassword,
              newPassword,
              confirmPassword,
            });
          }}
        >
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Current password
            </span>
            <input
              name="currentPassword"
              type="password"
              className={`field ${passwordErrors.currentPassword ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(passwordErrors.currentPassword)}
            />
            {passwordErrors.currentPassword && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {passwordErrors.currentPassword}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              New password
            </span>
            <input
              name="newPassword"
              type="password"
              minLength={8}
              maxLength={128}
              className={`field ${passwordErrors.newPassword ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(passwordErrors.newPassword)}
            />
            {passwordErrors.newPassword && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {passwordErrors.newPassword}
              </small>
            )}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Confirm new password
            </span>
            <input
              name="confirmPassword"
              type="password"
              maxLength={128}
              className={`field ${passwordErrors.confirmPassword ? "border-rose-500" : ""}`}
              aria-invalid={Boolean(passwordErrors.confirmPassword)}
            />
            {passwordErrors.confirmPassword && (
              <small className="mt-1.5 block text-sm text-rose-600">
                {passwordErrors.confirmPassword}
              </small>
            )}
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button loading={password.isPending}>Change password</Button>
            <Button
              type="button"
              variant="danger"
              loading={logoutAll.isPending}
              onClick={() => logoutAll.mutate()}
            >
              <LogOut className="size-4" />
              Logout all sessions
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
