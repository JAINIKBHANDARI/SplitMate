import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { fieldErrorsFrom, focusFirstInvalid } from "../lib/formErrors";
import { Button } from "../components/ui";
import { useAuth } from "../providers/auth";
export default function Auth({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const localErrors = validateAuthForm(mode, form, params);
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setError(localErrors.form || "");
      focusFirstInvalid(formEl, localErrors);
      return;
    }
    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      if (mode === "login") {
        await api.post("/auth/login", {
          email: form.get("email"),
          password: form.get("password"),
          remember: Boolean(form.get("remember")),
        });
        await refresh();
        navigate(location.state?.from || "/app");
      } else if (mode === "signup") {
        await api.post("/auth/signup", {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
          defaultCurrency: "INR",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        await refresh();
        navigate("/app");
      } else if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email: form.get("email") });
        setSent(true);
      } else {
        await api.post("/auth/reset-password", {
          token: params.get("token"),
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        });
        await refresh();
        navigate("/app");
      }
    } catch (issue) {
      const nextFieldErrors =
        issue instanceof ApiError ? fieldErrorsFrom(issue) : {};
      setFieldErrors(nextFieldErrors);
      setError(issue instanceof ApiError ? issue.message : "Please try again.");
      focusFirstInvalid(formEl, nextFieldErrors);
    } finally {
      setLoading(false);
    }
  };
  const heading =
    mode === "login"
      ? "Welcome back"
      : mode === "signup"
        ? "Make money simple"
        : mode === "forgot"
          ? "Reset your password"
          : "Choose a new password";
  const submitLabel =
    mode === "login"
      ? "Sign in"
      : mode === "signup"
        ? "Create account"
        : mode === "forgot"
          ? "Send reset link"
          : "Reset password";
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden bg-violet p-12 text-white lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid size-8 place-items-center rounded-xl bg-white text-sm text-violet">
            S
          </span>
          SplitMate
        </Link>
        <div className="my-auto">
          <p className="text-5xl font-extrabold leading-[.95] tracking-[-.05em]">
            Shared money,
            <br />
            made calm.
          </p>
          <div className="mt-10 space-y-4 text-white/75">
            <p className="flex gap-3">
              <CheckCircle2 className="size-5" />
              Every split reconciles exactly.
            </p>
            <p className="flex gap-3">
              <CheckCircle2 className="size-5" />
              Settle with fewer payments.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-12 flex items-center gap-2 text-lg font-extrabold lg:hidden"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-violet text-sm text-white">
              S
            </span>
            SplitMate
          </Link>
          {mode !== "login" && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-1 text-sm font-medium text-slate-500"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          )}
          <p className="eyebrow">SplitMate</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {sent
              ? "If that email exists, a reset link has been sent or logged in development."
              : mode === "login"
                ? "Good to see you."
                : "We will help you get back in."}
          </p>
          {sent ? (
            <div className="mt-8 rounded-2xl bg-mint/10 p-5 text-sm text-mint">
              If that email exists, a reset link is ready.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <Field
                  name="name"
                  label="Your name"
                  autoComplete="name"
                  error={fieldErrors.name}
                />
              )}
              {mode !== "reset" && (
                <Field
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={fieldErrors.email}
                />
              )}
              {mode !== "forgot" && (
                <Field
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={mode === "login" ? undefined : 8}
                  maxLength={128}
                  hint={
                    mode === "signup" || mode === "reset"
                      ? "8 to 128 characters"
                      : undefined
                  }
                  error={fieldErrors.password}
                />
              )}
              {(mode === "signup" || mode === "reset") && (
                <Field
                  name="confirmPassword"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  maxLength={128}
                  error={fieldErrors.confirmPassword}
                />
              )}{" "}
              {mode === "login" && (
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input name="remember" type="checkbox" />
                  Remember me
                </label>
              )}
              {error && (
                <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
                  {fieldErrors.form || error}
                </p>
              )}
              <Button type="submit" loading={loading} className="w-full">
                {submitLabel}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}
          {mode === "login" && (
            <>
              <Link
                to="/forgot-password"
                className="mt-4 block text-center text-sm font-semibold text-violet"
              >
                Forgot password?
              </Link>
              <p className="mt-8 text-center text-sm text-slate-500">
                New here?{" "}
                <Link className="font-bold text-violet" to="/signup">
                  Create an account
                </Link>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link className="font-bold text-violet" to="/login">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
function Field({ label, hint, error, type, ...props }) {
  const [visible, setVisible] = useState(false);
  const inputType = type === "password" && visible ? "text" : type;
  const describedBy = error ? `${props.name}-error` : undefined;
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-semibold">
        {label}
        {hint && <small className="font-normal text-slate-400">{hint}</small>}
      </span>
      <span className="relative block">
        <input
          required
          className={`field ${error ? "border-rose-500 focus:border-rose-500" : ""} ${type === "password" ? "pr-11" : ""}`}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-violet/10"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </span>
      {error && (
        <small id={describedBy} className="mt-1.5 block text-sm text-rose-600">
          {error}
        </small>
      )}
    </label>
  );
}

function validateAuthForm(mode, form, params) {
  const errors = {};
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");
  if (mode === "signup" && !String(form.get("name") || "").trim())
    errors.name = "Name is required.";
  if (mode !== "reset" && !/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (mode !== "forgot") {
    if (!password) errors.password = "Password is required.";
    else if (mode !== "login" && password.length < 8)
      errors.password = "Password must contain at least 8 characters.";
    else if (password.length > 128)
      errors.password = "Password must contain 128 characters or fewer.";
  }
  if ((mode === "signup" || mode === "reset") && password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (mode === "reset" && !params.get("token"))
    errors.form = "Reset link is missing or expired.";
  return errors;
}
