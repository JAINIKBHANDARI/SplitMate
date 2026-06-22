import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { Button } from "../components/ui";
import { useAuth } from "../providers/auth";
export default function Auth({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
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
        });
        await refresh();
        navigate("/app");
      }
    } catch (issue) {
      setError(issue instanceof ApiError ? issue.message : "Please try again.");
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
              ? "Check the server console for your reset link."
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
                <Field name="name" label="Your name" autoComplete="name" />
              )}
              {mode !== "reset" && (
                <Field
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
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
                  hint={
                    mode === "signup" || mode === "reset"
                      ? "At least 10 characters"
                      : undefined
                  }
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
                  {error}
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
function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-semibold">
        {label}
        {hint && <small className="font-normal text-slate-400">{hint}</small>}
      </span>
      <input required className="field" {...props} />
    </label>
  );
}
