import fs from "node:fs";
import path from "node:path";

const root = "D:\\react-auth-ui-849";
if (path.basename(root).toLowerCase() !== "react-auth-ui-849") {
  throw new Error(`Refusing to write outside the expected project: ${root}`);
}

const rm = (target) => {
  const full = path.join(root, target);
  if (fs.existsSync(full)) fs.rmSync(full, { recursive: true, force: true });
};
const ensureDir = (target) => fs.mkdirSync(path.join(root, target), { recursive: true });
const write = (target, content) => {
  const full = path.join(root, target);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart().replace(/\n/g, "\r\n"));
};

[
  "client",
  "server",
  "shared",
  "netlify",
  "public",
  ".builder",
  "components.json",
  "index.html",
  "netlify.toml",
  "pnpm-lock.yaml",
  "postcss.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
  "vite.config.ts",
  "vite.config.server.ts",
  ".env",
].forEach(rm);

[
  "client/public/assets",
  "client/src/api",
  "client/src/assets",
  "client/src/components/common",
  "client/src/components/layout",
  "client/src/context",
  "client/src/hooks",
  "client/src/layouts",
  "client/src/pages/Landing",
  "client/src/pages/Login",
  "client/src/pages/Register",
  "client/src/pages/ForgotPassword",
  "client/src/pages/ResetPassword",
  "client/src/pages/Dashboard",
  "client/src/pages/Groups",
  "client/src/pages/GroupDetails",
  "client/src/pages/Settlements",
  "client/src/pages/Profile",
  "client/src/pages/Settings",
  "client/src/pages/NotFound",
  "client/src/routes",
  "client/src/styles",
  "client/src/utils",
  "client/src/tests",
  "server/config",
  "server/controllers",
  "server/middleware",
  "server/models",
  "server/routes",
  "server/services",
  "server/utils",
  "server/validators",
  "server/scripts",
  "server/tests",
].forEach(ensureDir);

write("package.json", `{
  "name": "splitmate",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "install:all": "npm install && npm install --prefix client && npm install --prefix server",
    "dev": "concurrently -n client,server -c cyan,green \\"npm run dev --prefix client\\" \\"npm run dev --prefix server\\"",
    "build": "npm run build --prefix client && npm run build --prefix server",
    "lint": "npm run lint --prefix client && npm run lint --prefix server",
    "test": "npm run test --prefix server && npm run test --prefix client",
    "start": "npm start --prefix server",
    "seed": "npm run seed --prefix server",
    "load:test": "npm run load:test --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  },
  "engines": {
    "node": ">=20.11"
  }
}
`);

write(".gitignore", `node_modules
.env
.env.local
dist
coverage
*.log
npm-debug.log*
playwright-report
test-results
.DS_Store
.vscode/*
!.vscode/extensions.json
`);

write(".dockerignore", `node_modules
npm-debug.log
.env
.env.local
dist
coverage
.git
`);

write(".npmrc", `legacy-peer-deps=false
`);

write(".prettierrc", `{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
`);

write("render.yaml", `services:
  - type: web
    name: splitmate-api
    env: node
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "5000"
      - key: MONGO_URI
        sync: false
      - key: CLIENT_URL
        sync: false
      - key: JWT_ACCESS_SECRET
        sync: false
      - key: JWT_REFRESH_SECRET
        sync: false
      - key: ACCESS_TOKEN_EXPIRES_IN
        value: 15m
      - key: REFRESH_TOKEN_EXPIRES_IN
        value: 7d
      - key: COOKIE_DOMAIN
        sync: false
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_PORT
        value: "587"
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: EMAIL_FROM
        sync: false
`);

write("client/package.json", `{
  "name": "splitmate-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "lint": "node scripts/lint.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "axios": "^1.7.9",
    "chart.js": "^4.4.7",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "vite": "^8.0.2"
  },
  "devDependencies": {
    "vitest": "^4.1.0"
  }
}
`);

write("client/.env.example", `VITE_API_URL=http://localhost:5000/api
`);

write("client/vercel.json", `{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
`);

write("client/index.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f7f7fb" />
    <title>SplitMate - Smart Expense Splitter</title>
    <script>
      (function () {
        var stored = localStorage.getItem("splitmate-theme") || "system";
        var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.dataset.theme = stored === "system" ? (dark ? "dark" : "light") : stored;
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

write("client/vite.config.js", `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
});
`);

write("client/public/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#4f46e5"/>
  <path d="M19 22c0-5 4-9 13-9 5 0 9 1 12 3l-3 7c-3-2-6-3-9-3-4 0-6 1-6 3 0 6 20 2 20 16 0 6-5 11-15 11-6 0-11-2-15-5l4-7c3 3 7 4 11 4s7-1 7-4c0-6-19-2-19-16Z" fill="white"/>
</svg>
`);

write("client/scripts/lint.js", `import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", "coverage"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\\.(js|jsx)$/.test(entry.name)) files.push(full);
    else if (/\\.(ts|tsx)$/.test(entry.name)) {
      console.error("TypeScript file found:", path.relative(root, full));
      process.exitCode = 1;
    }
  }
}
walk(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exitCode = 1;
  }
}
`);

write("client/src/main.jsx", `import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/animations.css";
import "./styles/responsive.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./components/common/Toast.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
`);

write("client/src/App.jsx", `import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return <AppRoutes />;
}
`);

write("client/src/utils/currency.js", `export function toMinorUnits(value) {
  const raw = String(value ?? "").trim();
  if (!/^\\d+(\\.\\d{1,2})?$/.test(raw)) {
    throw new Error("Amount can have at most two decimal places.");
  }
  const [major, minor = ""] = raw.split(".");
  const amount = Number(major) * 100 + Number(minor.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  return amount;
}

export function fromMinorUnits(amountMinor = 0) {
  return (Number(amountMinor) / 100).toFixed(2);
}

export function formatMoney(amountMinor = 0, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amountMinor) / 100);
}
`);

write("client/src/utils/calculations.js", `export function splitExpense(amountMinor, method, participants) {
  const selected = participants.filter((item) => item.included !== false);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("Amount must be greater than zero.");
  if (!selected.length) throw new Error("Choose at least one participant.");
  if (method === "equal") return distribute(amountMinor, selected.map((item) => ({ item, weight: 1 })));
  if (method === "shares") {
    if (selected.some((item) => !Number.isFinite(Number(item.shares)) || Number(item.shares) <= 0)) throw new Error("Shares must be positive.");
    return distribute(amountMinor, selected.map((item) => ({ item, weight: Number(item.shares) })));
  }
  if (method === "percentage") {
    const total = selected.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.001) throw new Error("Percentages must total 100%.");
    return distribute(amountMinor, selected.map((item) => ({ item, weight: Number(item.percentage || 0) })));
  }
  const total = selected.reduce((sum, item) => sum + Number(item.exactMinor || 0), 0);
  if (total !== amountMinor) throw new Error("Exact amounts must equal the expense total.");
  return selected.map((item) => ({ memberId: item.memberId, shareMinor: Number(item.exactMinor) }));
}

function distribute(amountMinor, weighted) {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) throw new Error("At least one positive share is required.");
  const rows = weighted.map((entry) => {
    const raw = (amountMinor * entry.weight) / total;
    const floor = Math.floor(raw);
    return { ...entry, floor, remainder: raw - floor };
  }).sort((a, b) => b.remainder - a.remainder || String(a.item.memberId).localeCompare(String(b.item.memberId)));
  let left = amountMinor - rows.reduce((sum, item) => sum + item.floor, 0);
  return rows.map((entry) => ({ memberId: entry.item.memberId, shareMinor: entry.floor + (left-- > 0 ? 1 : 0) }));
}

export function calculateBalances(members, expenses, settlements = []) {
  const totals = new Map(members.map((member) => [member.id || member._id, { member, paidMinor: 0, shareMinor: 0, netMinor: 0 }]));
  for (const expense of expenses.filter((item) => !item.deletedAt)) {
    const payerId = String(expense.paidBy);
    const payer = totals.get(payerId);
    if (payer) payer.paidMinor += expense.amountMinor;
    for (const participant of expense.participants) {
      const row = totals.get(String(participant.memberId));
      if (row) row.shareMinor += participant.shareMinor;
    }
  }
  for (const row of totals.values()) row.netMinor = row.paidMinor - row.shareMinor;
  for (const settlement of settlements.filter((item) => item.status === "completed")) {
    const from = totals.get(String(settlement.fromMember));
    const to = totals.get(String(settlement.toMember));
    if (from) from.netMinor += settlement.amountMinor;
    if (to) to.netMinor -= settlement.amountMinor;
  }
  return [...totals.values()];
}
`);

write("client/src/utils/date.js", `export function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
`);

write("client/src/utils/validation.js", `export function emailValid(email) {
  return /^\\S+@\\S+\\.\\S+$/.test(String(email || "").trim());
}

export function required(value, message = "This field is required.") {
  return String(value || "").trim() ? "" : message;
}
`);

write("client/src/utils/constants.js", `export const categories = ["Food", "Travel", "Rent", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
export const groupTypes = ["Home", "Trip", "Friends", "Couple", "Office", "Other"];
export const currencies = ["INR", "USD", "EUR", "GBP"];
`);

write("client/src/api/axiosInstance.js", `import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export const axiosInstance = axios.create({
  baseURL: rawBaseUrl.endsWith("/api") ? rawBaseUrl : rawBaseUrl.replace(/\\/$/, "") + "/api",
  withCredentials: true,
  timeout: 15000,
});

let refreshPromise = null;
function normalize(error) {
  if (error instanceof ApiError) return error;
  if (!error.response) return new ApiError("Network error. Check your connection.", 0);
  return new ApiError(error.response.data?.message || "Something went wrong.", error.response.status, error.response.data?.errors || []);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const url = original.url || "";
    const isAuthWrite = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/refresh"].some((path) => url.includes(path));
    if (error.response?.status !== 401 || original._retry || isAuthWrite) throw normalize(error);
    original._retry = true;
    try {
      refreshPromise = refreshPromise || axiosInstance.post("/auth/refresh").finally(() => { refreshPromise = null; });
      await refreshPromise;
      return axiosInstance(original);
    } catch (refreshError) {
      if (window.location.pathname.startsWith("/app")) window.location.assign("/login");
      throw normalize(refreshError);
    }
  },
);

export async function unwrap(promise) {
  try {
    const response = await promise;
    return response.data?.data;
  } catch (error) {
    throw normalize(error);
  }
}
`);

write("client/src/api/authApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const authApi = {
  register: (body) => unwrap(axiosInstance.post("/auth/register", body)),
  login: (body) => unwrap(axiosInstance.post("/auth/login", body)),
  me: () => unwrap(axiosInstance.get("/auth/me")),
  refresh: () => unwrap(axiosInstance.post("/auth/refresh")),
  logout: () => unwrap(axiosInstance.post("/auth/logout")),
  logoutAll: () => unwrap(axiosInstance.post("/auth/logout-all")),
  forgotPassword: (body) => unwrap(axiosInstance.post("/auth/forgot-password", body)),
  resetPassword: (body) => unwrap(axiosInstance.post("/auth/reset-password", body)),
  changePassword: (body) => unwrap(axiosInstance.post("/auth/change-password", body)),
};
`);

write("client/src/api/groupApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const groupApi = {
  list: () => unwrap(axiosInstance.get("/groups")),
  create: (body) => unwrap(axiosInstance.post("/groups", body)),
  detail: (groupId) => unwrap(axiosInstance.get("/groups/" + groupId)),
  update: (groupId, body) => unwrap(axiosInstance.patch("/groups/" + groupId, body)),
  archive: (groupId) => unwrap(axiosInstance.post("/groups/" + groupId + "/archive")),
  activity: (groupId) => unwrap(axiosInstance.get("/groups/" + groupId + "/activity")),
};
`);

write("client/src/api/memberApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const memberApi = {
  add: (groupId, body) => unwrap(axiosInstance.post("/groups/" + groupId + "/members", body)),
  update: (groupId, memberId, body) => unwrap(axiosInstance.patch("/groups/" + groupId + "/members/" + memberId, body)),
  remove: (groupId, memberId) => unwrap(axiosInstance.delete("/groups/" + groupId + "/members/" + memberId)),
};
`);

write("client/src/api/expenseApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const expenseApi = {
  list: (groupId, params) => unwrap(axiosInstance.get("/groups/" + groupId + "/expenses", { params })),
  create: (groupId, body) => unwrap(axiosInstance.post("/groups/" + groupId + "/expenses", body)),
  update: (groupId, expenseId, body) => unwrap(axiosInstance.patch("/groups/" + groupId + "/expenses/" + expenseId, body)),
  remove: (groupId, expenseId) => unwrap(axiosInstance.delete("/groups/" + groupId + "/expenses/" + expenseId)),
};
`);

write("client/src/api/settlementApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const settlementApi = {
  list: (groupId) => unwrap(axiosInstance.get("/groups/" + groupId + "/settlements")),
  create: (groupId, body) => unwrap(axiosInstance.post("/groups/" + groupId + "/settlements", body)),
  update: (groupId, settlementId, body) => unwrap(axiosInstance.patch("/groups/" + groupId + "/settlements/" + settlementId, body)),
};
`);

write("client/src/api/dashboardApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const dashboardApi = {
  overview: () => unwrap(axiosInstance.get("/dashboard")),
};
`);

write("client/src/api/userApi.js", `import { axiosInstance, unwrap } from "./axiosInstance.js";
export const userApi = {
  updateMe: (body) => unwrap(axiosInstance.patch("/users/me", body)),
};
`);

write("client/src/context/ThemeContext.jsx", `import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

function resolveTheme(mode) {
  if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return mode;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("splitmate-theme") || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));
  useEffect(() => {
    const apply = () => {
      const next = resolveTheme(theme);
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
      localStorage.setItem("splitmate-theme", theme);
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
`);

write("client/src/hooks/useTheme.js", `import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
`);

write("client/src/context/AuthContext.jsx", `import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  const login = async (body) => {
    const data = await authApi.login(body);
    setUser(data.user);
    return data.user;
  };
  const register = async (body) => {
    const data = await authApi.register(body);
    setUser(data.user);
    return data.user;
  };
  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };
  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, refreshUser, setUser }), [user, loading, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
`);

write("client/src/hooks/useAuth.js", `import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
`);

write("client/src/hooks/useDebounce.js", `import { useEffect, useState } from "react";
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
`);

write("client/src/hooks/useMediaQuery.js", `import { useEffect, useState } from "react";
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
`);

write("client/src/hooks/useOutsideClick.js", `import { useEffect } from "react";
export function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside(event);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}
`);

write("client/src/components/common/Button.jsx", `export default function Button({ children, loading, variant = "primary", className = "", ...props }) {
  return (
    <button className={"btn btn-" + variant + " " + className} disabled={loading || props.disabled} {...props}>
      {loading && <span className="spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
`);

write("client/src/components/common/Input.jsx", `export default function Input({ label, error, helper, id, ...props }) {
  const inputId = id || props.name;
  const errorId = error ? inputId + "-error" : undefined;
  return (
    <label className="field-wrap" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input id={inputId} className={"input " + (error ? "input-error" : "")} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props} />
      {helper && !error && <small className="field-helper">{helper}</small>}
      {error && <small id={errorId} className="field-error">{error}</small>}
    </label>
  );
}
`);

write("client/src/components/common/Modal.jsx", `import { useEffect, useRef } from "react";
import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const close = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", close);
      previous?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex="-1" ref={dialogRef} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <Button variant="ghost" type="button" onClick={onClose}>Close</Button>
        </header>
        {children}
      </section>
    </div>
  );
}
`);

write("client/src/components/common/Drawer.jsx", `import Modal from "./Modal.jsx";
export default function Drawer(props) {
  return <Modal {...props} />;
}
`);

write("client/src/components/common/BottomSheet.jsx", `import Modal from "./Modal.jsx";
export default function BottomSheet(props) {
  return <Modal {...props} />;
}
`);

write("client/src/components/common/Toast.jsx", `import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (message, tone = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };
  const value = useMemo(() => ({ push }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => <div key={toast.id} className={"toast toast-" + toast.tone}>{toast.message}</div>)}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
`);

write("client/src/components/common/Loader.jsx", `export default function Loader({ label = "Loading" }) {
  return <div className="loader"><span className="spinner" /> {label}</div>;
}
`);

write("client/src/components/common/Skeleton.jsx", `export default function Skeleton({ className = "" }) {
  return <div className={"skeleton " + className} aria-hidden="true" />;
}
`);

write("client/src/components/common/EmptyState.jsx", `import Button from "./Button.jsx";
export default function EmptyState({ title, body, action, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action && <Button type="button" onClick={onAction}>{action}</Button>}
    </div>
  );
}
`);

write("client/src/components/common/ErrorState.jsx", `import Button from "./Button.jsx";
export default function ErrorState({ title = "Something went wrong", body, onRetry }) {
  return (
    <div className="error-state">
      <h3>{title}</h3>
      <p>{body || "Please try again."}</p>
      {onRetry && <Button type="button" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
`);

write("client/src/components/common/Avatar.jsx", `export default function Avatar({ name = "SplitMate", color }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "S";
  return <span className="avatar" style={{ backgroundColor: color || undefined }}>{initials}</span>;
}
`);

write("client/src/components/common/Badge.jsx", `export default function Badge({ children, tone = "neutral" }) {
  return <span className={"badge badge-" + tone}>{children}</span>;
}
`);

write("client/src/components/common/ConfirmDialog.jsx", `import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
export default function ConfirmDialog({ open, title, body, onCancel, onConfirm, confirmLabel = "Confirm" }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="muted">{body}</p>
      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
`);

write("client/src/components/common/CollapsibleSection.jsx", `import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CollapsibleSection({ icon: Icon, title, summary, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="collapsible">
      <button className="collapsible-trigger" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span className="collapsible-title">
          {Icon && <Icon size={18} />}
          <span>{title}</span>
          {count !== undefined && <span className="count-pill">{count}</span>}
        </span>
        <span className="collapsible-summary">{summary}</span>
        <ChevronDown className={open ? "rotate" : ""} size={18} />
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </section>
  );
}
`);

write("client/src/components/layout/Sidebar.jsx", `import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, UsersRound, ReceiptIndianRupee, UserCircle, Settings } from "lucide-react";

const links = [
  ["/app", "Home", LayoutDashboard],
  ["/app/groups", "Groups", UsersRound],
  ["/app/settlements", "Settlements", ReceiptIndianRupee],
  ["/app/profile", "Profile", UserCircle],
  ["/app/settings", "Settings", Settings],
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/app"><span>S</span><strong>SplitMate</strong></Link>
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
`);

write("client/src/components/layout/Header.jsx", `import { LogOut, Moon, Sun, Monitor } from "lucide-react";
import Button from "../common/Button.jsx";
import Avatar from "../common/Avatar.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../hooks/useTheme.js";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Workspace</p>
        <h1>Welcome, {user?.name?.split(" ")[0] || "friend"}</h1>
      </div>
      <div className="topbar-actions">
        <select className="compact-select" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Theme">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        {theme === "dark" ? <Moon size={18} /> : theme === "light" ? <Sun size={18} /> : <Monitor size={18} />}
        <Avatar name={user?.name} />
        <Button variant="ghost" type="button" onClick={logout}><LogOut size={16} /> Logout</Button>
      </div>
    </header>
  );
}
`);

write("client/src/components/layout/MobileNavigation.jsx", `import { NavLink } from "react-router-dom";
import { Home, PlusCircle, ReceiptIndianRupee, User, UsersRound } from "lucide-react";

export default function MobileNavigation() {
  const links = [
    ["/app", "Home", Home],
    ["/app/groups", "Groups", UsersRound],
    ["/app/groups", "Add", PlusCircle],
    ["/app/settlements", "Settle", ReceiptIndianRupee],
    ["/app/profile", "Profile", User],
  ];
  return (
    <nav className="mobile-nav">
      {links.map(([to, label, Icon]) => (
        <NavLink key={label} to={to} end={to === "/app"} className={({ isActive }) => "mobile-nav-link " + (isActive ? "active" : "")}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
`);

write("client/src/components/layout/PageContainer.jsx", `export default function PageContainer({ children, narrow = false }) {
  return <main className={"page-container " + (narrow ? "page-container-narrow" : "")}>{children}</main>;
}
`);

write("client/src/layouts/AppLayout.jsx", `import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import MobileNavigation from "../components/layout/MobileNavigation.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <Outlet />
      </div>
      <MobileNavigation />
    </div>
  );
}
`);

write("client/src/layouts/AuthLayout.jsx", `import { Link } from "react-router-dom";
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand auth-brand" to="/"><span>S</span><strong>SplitMate</strong></Link>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
      <aside className="auth-preview" aria-label="SplitMate preview">
        <div className="preview-card">
          <p className="eyebrow">Goa Trip</p>
          <h2>You get ₹2,400</h2>
          <div className="mini-row"><span>Rahul owes you</span><strong>₹800</strong></div>
          <div className="mini-row"><span>Priya owes Dev</span><strong>₹450</strong></div>
          <div className="mini-row settled"><span>Jainik and Dev</span><strong>Settled</strong></div>
        </div>
      </aside>
    </main>
  );
}
`);

write("client/src/routes/ProtectedRoute.jsx", `import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-screen"><Loader label="Restoring your session" /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
`);

write("client/src/routes/AppRoutes.jsx", `import { Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Landing from "../pages/Landing/index.jsx";
import Login from "../pages/Login/index.jsx";
import Register from "../pages/Register/index.jsx";
import ForgotPassword from "../pages/ForgotPassword/index.jsx";
import ResetPassword from "../pages/ResetPassword/index.jsx";
import Dashboard from "../pages/Dashboard/index.jsx";
import Groups from "../pages/Groups/index.jsx";
import GroupDetails from "../pages/GroupDetails/index.jsx";
import Settlements from "../pages/Settlements/index.jsx";
import Profile from "../pages/Profile/index.jsx";
import Settings from "../pages/Settings/index.jsx";
import NotFound from "../pages/NotFound/index.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/groups" element={<Groups />} />
          <Route path="/app/groups/:groupId" element={<GroupDetails />} />
          <Route path="/app/settlements" element={<Settlements />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
`);

write("client/src/pages/Landing/index.jsx", `import { Link } from "react-router-dom";
import { ArrowRight, Calculator, CheckCircle2, Moon, ReceiptText, UsersRound } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

export default function Landing() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="landing">
      <header className="landing-header">
        <Link className="brand" to="/"><span>S</span><strong>SplitMate</strong></Link>
        <nav>
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <button type="button" className="icon-btn" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme"><Moon size={18} /></button>
          <Link className="btn btn-secondary" to="/login">Login</Link>
          <Link className="btn btn-primary" to="/register">Start free</Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Smart expense sharing</p>
            <h1>Split bills without awkward math.</h1>
            <p className="hero-copy">Create a group, add people by name, record expenses, and see exactly who owes whom.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/register">Create your first group <ArrowRight size={18} /></Link>
              <Link className="btn btn-secondary" to="/login">I already have an account</Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="card-header">
              <div><p className="eyebrow">Goa Trip</p><h2>All balances</h2></div>
              <CheckCircle2 />
            </div>
            <div className="balance-line"><span>Rahul owes Jainik</span><strong>₹800</strong></div>
            <div className="balance-line"><span>Priya owes Dev</span><strong>₹450</strong></div>
            <div className="balance-line settled"><span>Everyone else</span><strong>Settled</strong></div>
          </div>
        </section>
        <section id="features" className="feature-grid">
          <article><UsersRound /><h3>Add people by name</h3><p>Guests work immediately. Accounts can be linked later.</p></article>
          <article><ReceiptText /><h3>Four split methods</h3><p>Equal, exact, percentage, and shares reconcile to the paise.</p></article>
          <article><Calculator /><h3>Clear settle up</h3><p>See plain-English payments instead of confusing signs.</p></article>
        </section>
        <section id="workflow" className="workflow">
          <h2>One simple flow</h2>
          <ol>
            <li>Create group</li>
            <li>Add people</li>
            <li>Add expense</li>
            <li>Choose who paid</li>
            <li>Split between people</li>
            <li>Settle up</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
`);

write("client/src/pages/Login/index.jsx", `import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../components/common/Toast.jsx";
import { emailValid } from "../../utils/validation.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!emailValid(form.email)) nextErrors.email = "Enter a valid email.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await login(form);
      toast.push("Welcome back.");
      navigate(location.state?.from || "/app");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Welcome back" subtitle="Continue managing shared expenses.">
      <form className="auth-form" onSubmit={submit}>
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} error={errors.email} />
        <div className="password-row">
          <Input label="Password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={update} error={errors.password} />
          <button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="form-row">
          <label className="check-row"><input name="remember" type="checkbox" checked={form.remember} onChange={update} /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {errors.form && <p className="form-error">{errors.form}</p>}
        <Button type="submit" loading={loading}>Sign in</Button>
      </form>
      <p className="switch-auth">New here? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
`);

write("client/src/pages/Register/index.jsx", `import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../components/common/Toast.jsx";
import { emailValid } from "../../utils/validation.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!emailValid(form.email)) nextErrors.email = "Enter a valid email.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await register(form);
      toast.push("Account created.");
      navigate("/app");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Create your account" subtitle="Start splitting expenses without awkward math.">
      <form className="auth-form" onSubmit={submit}>
        <Input label="Full name" name="name" autoComplete="name" value={form.name} onChange={update} error={errors.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} error={errors.email} />
        <div className="password-row">
          <Input label="Password" name="password" type={visible ? "text" : "password"} autoComplete="new-password" helper="8 characters minimum" value={form.password} onChange={update} error={errors.password} />
          <button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <Input label="Confirm password" name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={update} error={errors.confirmPassword} />
        {errors.form && <p className="form-error">{errors.form}</p>}
        <Button type="submit" loading={loading}>Create account</Button>
      </form>
      <p className="switch-auth">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
`);

write("client/src/pages/ForgotPassword/index.jsx", `import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { authApi } from "../../api/authApi.js";
import { emailValid } from "../../utils/validation.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (!emailValid(email)) return setError("Enter a valid email.");
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (issue) {
      setError(issue.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Reset your password" subtitle="We will send a secure reset link if the email exists.">
      {sent ? <div className="success-box">Check your email or development server logs for the reset link.</div> : (
        <form className="auth-form" onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error} />
          <Button type="submit" loading={loading}>Send reset link</Button>
        </form>
      )}
      <p className="switch-auth"><Link to="/login">Back to login</Link></p>
    </AuthLayout>
  );
}
`);

write("client/src/pages/ResetPassword/index.jsx", `import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { authApi } from "../../api/authApi.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) return setError("Use at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await authApi.resetPassword({ token: params.get("token"), ...form });
      navigate("/app");
    } catch (issue) {
      setError(issue.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Choose a new password" subtitle="Use something private and memorable.">
      <form className="auth-form" onSubmit={submit}>
        <Input label="New password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={update} />
        <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update} error={error} />
        <Button type="submit" loading={loading}>Reset password</Button>
      </form>
    </AuthLayout>
  );
}
`);

write("client/src/pages/Dashboard/index.jsx", `import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { Plus, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboardApi.js";
import Button from "../../components/common/Button.jsx";
import CollapsibleSection from "../../components/common/CollapsibleSection.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import Loader from "../../components/common/Loader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { formatMoney } from "../../utils/currency.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      setState({ loading: false, error: "", data: await dashboardApi.overview() });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  };
  useEffect(() => { load(); }, []);
  if (state.loading) return <PageContainer><Loader label="Loading dashboard" /></PageContainer>;
  if (state.error) return <PageContainer><ErrorState body={state.error} onRetry={load} /></PageContainer>;
  const data = state.data;
  const hasGroups = data.groups.length > 0;
  const chartData = {
    labels: data.categorySpending.map((item) => item.category),
    datasets: [{ label: "Spent", data: data.categorySpending.map((item) => item.amountMinor / 100), backgroundColor: "#4f46e5", borderRadius: 8 }],
  };
  return (
    <PageContainer>
      <div className="page-title-row">
        <div><p className="eyebrow">Dashboard</p><h2>Your shared money at a glance</h2></div>
        <Link className="btn btn-primary" to="/app/groups"><Plus size={18} /> Create group</Link>
      </div>
      {!hasGroups && <EmptyState title="Create your first group" body="Add people, record an expense, and SplitMate will show who owes whom." action="Create group" onAction={() => location.assign("/app/groups")} />}
      <div className="metric-grid">
        <Metric icon={ReceiptText} label="Total spent" value={formatMoney(data.summary.totalSpentMinor)} />
        <Metric icon={WalletCards} label="You paid" value={formatMoney(data.summary.youPaidMinor)} />
        <Metric icon={WalletCards} label="Your share" value={formatMoney(data.summary.yourShareMinor)} />
        <Metric icon={UsersRound} label="Active groups" value={String(data.summary.activeGroups)} />
      </div>
      <CollapsibleSection icon={ReceiptText} title="Recent expenses" summary={data.recentExpenses.length + " recent"} count={data.recentExpenses.length}>
        <div className="list-panel">
          {data.recentExpenses.map((expense) => <Link key={expense._id} to={"/app/groups/" + expense.groupId} className="list-row"><span>{expense.title}</span><strong>{formatMoney(expense.amountMinor)}</strong></Link>)}
          {!data.recentExpenses.length && <p className="muted">No expenses yet.</p>}
        </div>
      </CollapsibleSection>
      <CollapsibleSection icon={UsersRound} title="Groups" summary={data.groups.length + " active"} count={data.groups.length}>
        <div className="card-grid">{data.groups.map((group) => <Link className="group-card" to={"/app/groups/" + group._id} key={group._id}><h3>{group.name}</h3><p>{group.memberCount} people</p><strong>{formatMoney(group.totalSpentMinor)}</strong></Link>)}</div>
      </CollapsibleSection>
      {data.categorySpending.length > 0 && (
        <CollapsibleSection icon={ReceiptText} title="Category spending" summary="Real expense data">
          <div className="chart-box"><Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>
        </CollapsibleSection>
      )}
    </PageContainer>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <article className="metric-card"><Icon size={20} /><span>{label}</span><strong>{value}</strong></article>;
}
`);

write("client/src/pages/Groups/index.jsx", `import { Plus, Trash2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { groupApi } from "../../api/groupApi.js";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Modal from "../../components/common/Modal.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { currencies, groupTypes } from "../../utils/constants.js";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const data = await groupApi.list();
    setGroups(data.groups);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  return (
    <PageContainer>
      <div className="page-title-row">
        <div><p className="eyebrow">Groups</p><h2>Shared spaces</h2></div>
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Create group</Button>
      </div>
      {!loading && !groups.length && <EmptyState title="No groups yet" body="Start with a trip, flat, office lunch, or any shared plan." action="Create group" onAction={() => setOpen(true)} />}
      <div className="card-grid">
        {groups.map((group) => <Link key={group._id} className="group-card" to={"/app/groups/" + group._id}><UsersRound /><h3>{group.name}</h3><p>{group.type} · {group.memberCount} people</p></Link>)}
      </div>
      <CreateGroupModal open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load(); }} />
    </PageContainer>
  );
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", type: "Trip", currency: "INR", colour: "#4f46e5" });
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const addPerson = () => {
    const name = person.trim();
    if (!name) return;
    if (people.some((item) => item.displayName.toLowerCase() === name.toLowerCase())) return setError("That name is already added.");
    setPeople((current) => [...current, { id: crypto.randomUUID(), displayName: name, email: "" }]);
    setPerson("");
    setError("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setError("Group name is required.");
    setSaving(true);
    try {
      await groupApi.create({ ...form, members: people });
      onCreated();
    } catch (issue) {
      setError(issue.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal open={open} title="Create group" onClose={onClose}>
      <form className="stack-form" onSubmit={submit}>
        <Input label="Group name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="form-grid">
          <label className="field-wrap"><span className="field-label">Group type</span><select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{groupTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="field-wrap"><span className="field-label">Currency</span><select className="input" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>{currencies.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="add-person-row">
          <Input label="Add people by name" value={person} onChange={(event) => setPerson(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addPerson(); } }} />
          <Button type="button" variant="secondary" onClick={addPerson}>Add</Button>
        </div>
        <div className="chip-list">{people.map((item) => <span className="chip" key={item.id}>{item.displayName}<button type="button" onClick={() => setPeople((current) => current.filter((personItem) => personItem.id !== item.id))}><Trash2 size={14} /></button></span>)}</div>
        {error && <p className="form-error">{error}</p>}
        <Button type="submit" loading={saving}>Create group</Button>
      </form>
    </Modal>
  );
}
`);

write("client/src/pages/GroupDetails/index.jsx", `import { Activity, Plus, ReceiptText, Settings, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { expenseApi } from "../../api/expenseApi.js";
import { groupApi } from "../../api/groupApi.js";
import { memberApi } from "../../api/memberApi.js";
import { settlementApi } from "../../api/settlementApi.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CollapsibleSection from "../../components/common/CollapsibleSection.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Loader from "../../components/common/Loader.jsx";
import Modal from "../../components/common/Modal.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { categories } from "../../utils/constants.js";
import { formatMoney, toMinorUnits } from "../../utils/currency.js";

export default function GroupDetails() {
  const { groupId } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const load = async () => {
    setLoading(true);
    setData(await groupApi.detail(groupId));
    setLoading(false);
  };
  useEffect(() => { load(); }, [groupId]);
  if (loading) return <PageContainer><Loader label="Loading group" /></PageContainer>;
  const { group, members, expenses, balances, suggestions, settlements, activity } = data;
  return (
    <PageContainer>
      <div className="group-hero">
        <Avatar name={group.name} color={group.colour} />
        <div><p className="eyebrow">{group.type}</p><h2>{group.name}</h2><p>{members.length} people · {formatMoney(data.totalSpentMinor, group.currency)} spent</p></div>
        <div className="hero-actions"><Button onClick={() => setExpenseOpen(true)}><Plus size={18} /> Add expense</Button><Button variant="secondary" onClick={() => setMemberOpen(true)}><UsersRound size={18} /> Add people</Button></div>
      </div>
      <CollapsibleSection icon={WalletCards} title="Who owes whom" summary={suggestions.length ? suggestions.length + " suggested payments" : "All settled"} count={suggestions.length}>
        {suggestions.length ? suggestions.map((item) => <div className="suggestion-row" key={item.fromMember + item.toMember}><span>{memberName(members, item.fromMember)} pays {memberName(members, item.toMember)}</span><strong>{formatMoney(item.amountMinor, group.currency)}</strong><Button variant="secondary" onClick={async () => { await settlementApi.create(groupId, item); toast.push("Settlement recorded."); load(); }}>Record</Button></div>) : <EmptyState title="All settled" body="No one owes anything in this group." />}
      </CollapsibleSection>
      <CollapsibleSection icon={ReceiptText} title="Recent expenses" summary={expenses.length + " expenses"} count={expenses.length}>
        <div className="list-panel">
          {expenses.map((expense) => <div className="list-row" key={expense._id}><span>{expense.title}<small>{memberName(members, expense.paidBy)} paid</small></span><strong>{formatMoney(expense.amountMinor, group.currency)}</strong></div>)}
        </div>
      </CollapsibleSection>
      <CollapsibleSection icon={UsersRound} title="Members" summary={members.length + " people"} count={members.length}>
        <div className="member-grid">{balances.map((row) => <article className="member-card" key={row.member._id}><Avatar name={row.member.displayName} /><h3>{row.member.displayName}</h3><p>Paid {formatMoney(row.paidMinor, group.currency)}</p><p>Share {formatMoney(row.shareMinor, group.currency)}</p><Badge tone={row.netMinor > 0 ? "success" : row.netMinor < 0 ? "warning" : "neutral"}>{row.netMinor > 0 ? "Gets " : row.netMinor < 0 ? "Owes " : "Settled "}{formatMoney(Math.abs(row.netMinor), group.currency)}</Badge></article>)}</div>
      </CollapsibleSection>
      <CollapsibleSection icon={Activity} title="Activity history" summary={activity.length + " updates"} count={activity.length} defaultOpen={false}>
        <div className="list-panel">{activity.map((item) => <div className="list-row" key={item._id}><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString()}</small></div>)}</div>
      </CollapsibleSection>
      <CollapsibleSection icon={Settings} title="Group settings" summary={group.archived ? "Archived" : "Active"} defaultOpen={false}>
        <Button variant="danger" onClick={async () => { await groupApi.archive(groupId); toast.push("Group archived."); load(); }}>Archive group</Button>
      </CollapsibleSection>
      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} group={group} members={members} onSaved={() => { setExpenseOpen(false); toast.push("Expense added."); load(); }} />
      <AddMemberModal open={memberOpen} onClose={() => setMemberOpen(false)} groupId={groupId} onSaved={() => { setMemberOpen(false); toast.push("Person added."); load(); }} />
    </PageContainer>
  );
}

function memberName(members, id) {
  return members.find((member) => String(member._id) === String(id))?.displayName || "Someone";
}

function ExpenseModal({ open, onClose, group, members, onSaved }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", expenseDate: new Date().toISOString().slice(0, 10), paidBy: "", splitMethod: "equal", notes: "" });
  const [selected, setSelected] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setForm((current) => ({ ...current, paidBy: members[0]?._id || "" }));
      setSelected(Object.fromEntries(members.map((member) => [member._id, { included: true, exact: "", percentage: "", shares: "1" }])));
    }
  }, [open, members]);
  const amountMinor = useMemo(() => { try { return toMinorUnits(form.amount); } catch { return 0; } }, [form.amount]);
  const participants = members.map((member) => ({ memberId: member._id, included: selected[member._id]?.included !== false, exactMinor: selected[member._id]?.exact ? toMinorUnits(selected[member._id].exact) : 0, percentage: Number(selected[member._id]?.percentage || 0), shares: Number(selected[member._id]?.shares || 1) }));
  const selectedCount = participants.filter((item) => item.included).length;
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await expenseApi.create(group._id, { ...form, amountMinor, participants });
      onSaved();
    } catch (issue) {
      setError(issue.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal open={open} title="Add expense" onClose={onClose}>
      <form className="stack-form" onSubmit={submit}>
        <Input label="Expense title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <div className="form-grid"><Input label="Amount" value={form.amount} inputMode="decimal" onChange={(event) => setForm({ ...form, amount: event.target.value })} /><label className="field-wrap"><span className="field-label">Category</span><select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className="form-grid"><label className="field-wrap"><span className="field-label">Who paid?</span><select className="input" value={form.paidBy} onChange={(event) => setForm({ ...form, paidBy: event.target.value })}>{members.map((member) => <option key={member._id} value={member._id}>{member.displayName}</option>)}</select></label><Input label="Date" type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} /></div>
        <label className="field-wrap"><span className="field-label">Split method</span><select className="input" value={form.splitMethod} onChange={(event) => setForm({ ...form, splitMethod: event.target.value })}><option value="equal">Split equally</option><option value="exact">Exact amount</option><option value="percentage">Percentage</option><option value="shares">Shares</option></select></label>
        <div className="participant-box"><strong>Split between {selectedCount} people</strong>{members.map((member) => <div className="participant-row" key={member._id}><label><input type="checkbox" checked={selected[member._id]?.included !== false} onChange={(event) => setSelected({ ...selected, [member._id]: { ...selected[member._id], included: event.target.checked } })} /> {member.displayName}</label>{form.splitMethod === "exact" && <input className="mini-input" placeholder="₹" value={selected[member._id]?.exact || ""} onChange={(event) => setSelected({ ...selected, [member._id]: { ...selected[member._id], exact: event.target.value } })} />}{form.splitMethod === "percentage" && <input className="mini-input" placeholder="%" value={selected[member._id]?.percentage || ""} onChange={(event) => setSelected({ ...selected, [member._id]: { ...selected[member._id], percentage: event.target.value } })} />}{form.splitMethod === "shares" && <input className="mini-input" placeholder="shares" value={selected[member._id]?.shares || "1"} onChange={(event) => setSelected({ ...selected, [member._id]: { ...selected[member._id], shares: event.target.value } })} />}</div>)}</div>
        <p className="summary-line">{memberName(members, form.paidBy)} paid {amountMinor ? formatMoney(amountMinor, group.currency) : "₹0"} for {selectedCount} people.</p>
        {error && <p className="form-error">{error}</p>}
        <Button type="submit" loading={saving}>Save expense</Button>
      </form>
    </Modal>
  );
}

function AddMemberModal({ open, onClose, groupId, onSaved }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal open={open} title="Add people" onClose={onClose}>
      <form className="stack-form" onSubmit={async (event) => { event.preventDefault(); try { await memberApi.add(groupId, { displayName, email }); onSaved(); } catch (issue) { setError(issue.message); } }}>
        <Input label="Name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        <Input label="Email optional" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {error && <p className="form-error">{error}</p>}
        <Button>Add person</Button>
      </form>
    </Modal>
  );
}
`);

write("client/src/pages/Settlements/index.jsx", `import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer.jsx";

export default function Settlements() {
  return (
    <PageContainer narrow>
      <p className="eyebrow">Settlements</p>
      <h2>Settle up from a group</h2>
      <p className="muted">Open a group to view smart payment suggestions, record partial payments, and mark settlements complete.</p>
      <Link className="btn btn-primary" to="/app/groups">Open groups</Link>
    </PageContainer>
  );
}
`);

write("client/src/pages/Profile/index.jsx", `import { useState } from "react";
import { authApi } from "../../api/authApi.js";
import { userApi } from "../../api/userApi.js";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", defaultCurrency: user?.defaultCurrency || "INR" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  return (
    <PageContainer narrow>
      <p className="eyebrow">Profile</p>
      <h2>Your account</h2>
      <form className="stack-form" onSubmit={async (event) => { event.preventDefault(); const data = await userApi.updateMe(form); setUser(data.user); setMessage("Profile saved."); }}>
        <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input label="Default currency" value={form.defaultCurrency} onChange={(event) => setForm({ ...form, defaultCurrency: event.target.value.toUpperCase() })} />
        <Button>Save profile</Button>
      </form>
      <form className="stack-form panel" onSubmit={async (event) => { event.preventDefault(); await authApi.changePassword(password); setMessage("Password changed. Please use the new one next time."); }}>
        <h3>Change password</h3>
        <Input label="Current password" type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} />
        <Input label="New password" type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} />
        <Input label="Confirm new password" type="password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} />
        <Button>Change password</Button>
      </form>
      {message && <p className="success-box">{message}</p>}
    </PageContainer>
  );
}
`);

write("client/src/pages/Settings/index.jsx", `import PageContainer from "../../components/layout/PageContainer.jsx";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";
import { useTheme } from "../../hooks/useTheme.js";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <PageContainer narrow>
      <p className="eyebrow">Settings</p>
      <h2>Preferences</h2>
      <label className="field-wrap"><span className="field-label">Theme</span><select className="input" value={theme} onChange={(event) => setTheme(event.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <Button variant="danger" onClick={async () => { await authApi.logoutAll(); location.assign("/login"); }}>Logout all sessions</Button>
    </PageContainer>
  );
}
`);

write("client/src/pages/NotFound/index.jsx", `import { Link } from "react-router-dom";
import Button from "../../components/common/Button.jsx";

export default function NotFound() {
  return (
    <main className="center-screen">
      <section className="not-found">
        <p className="eyebrow">404</p>
        <h1>This page is not here</h1>
        <p className="muted">Let us take you back to SplitMate.</p>
        <Link to="/"><Button>Back home</Button></Link>
      </section>
    </main>
  );
}
`);

write("client/src/styles/variables.css", `:root,
[data-theme="light"] {
  color-scheme: light;
  --paper: #f7f7fb;
  --panel: #ffffff;
  --panel-strong: #f0f2f7;
  --ink: #172033;
  --muted: #667085;
  --line: #e3e7ef;
  --primary: #4f46e5;
  --primary-dark: #3730a3;
  --success: #12856f;
  --warning: #ad6b12;
  --danger: #c24133;
  --radius: 14px;
  --shadow: 0 18px 50px rgba(23, 32, 51, 0.09);
}
[data-theme="dark"] {
  color-scheme: dark;
  --paper: #11151f;
  --panel: #1a2030;
  --panel-strong: #22293b;
  --ink: #f4f7fb;
  --muted: #aab4c5;
  --line: #30394d;
  --primary: #8b82ff;
  --primary-dark: #aaa4ff;
  --success: #55c6a7;
  --warning: #efbd6d;
  --danger: #f18472;
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.38);
}
`);

write("client/src/styles/reset.css", `* { box-sizing: border-box; }
html { min-width: 320px; background: var(--paper); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
body { margin: 0; min-height: 100vh; background: var(--paper); }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
a { color: inherit; text-decoration: none; }
img, svg { max-width: 100%; }
:focus-visible { outline: 3px solid color-mix(in srgb, var(--primary), white 35%); outline-offset: 2px; }
`);

write("client/src/styles/global.css", `.center-screen { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; }
.brand span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; background: var(--primary); color: white; }
.eyebrow { color: var(--muted); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; margin: 0; }
.muted { color: var(--muted); line-height: 1.6; }
.landing { min-height: 100vh; overflow-x: hidden; }
.landing-header { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; padding: 18px clamp(16px, 5vw, 72px); background: color-mix(in srgb, var(--paper), transparent 12%); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); }
.landing-header nav { display: flex; align-items: center; gap: 14px; }
.landing-header nav a:not(.btn) { color: var(--muted); font-weight: 700; font-size: 0.92rem; }
.hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); gap: 48px; align-items: center; max-width: 1180px; margin: 0 auto; padding: 86px 20px 56px; }
.hero h1 { font-size: clamp(3rem, 8vw, 5.6rem); letter-spacing: -0.07em; line-height: 0.95; margin: 12px 0 18px; }
.hero-copy { color: var(--muted); font-size: 1.1rem; line-height: 1.7; max-width: 620px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.hero-card, .preview-card { background: var(--panel); border: 1px solid var(--line); box-shadow: var(--shadow); border-radius: 24px; padding: 24px; }
.card-header, .page-title-row, .group-hero { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.balance-line, .mini-row, .suggestion-row, .list-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.settled strong { color: var(--success); }
.feature-grid { max-width: 1100px; margin: 0 auto; padding: 40px 20px; display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); }
.feature-grid article, .metric-card, .member-card, .group-card, .panel { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
.feature-grid svg { color: var(--primary); }
.workflow { max-width: 1000px; margin: 0 auto; padding: 56px 20px 90px; }
.workflow ol { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0; list-style: none; counter-reset: step; }
.workflow li { counter-increment: step; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px; font-weight: 800; }
.workflow li::before { content: counter(step); display: inline-grid; place-items: center; width: 26px; height: 26px; margin-right: 8px; border-radius: 50%; background: var(--primary); color: white; font-size: 0.82rem; }
.app-shell { min-height: 100vh; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
.app-main { min-width: 0; }
.page-container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 96px; }
.page-container-narrow { max-width: 720px; }
.topbar { min-height: 76px; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid var(--line); background: var(--panel); position: sticky; top: 0; z-index: 3; }
.topbar h1 { margin: 0; font-size: 1.25rem; }
.topbar-actions { display: flex; align-items: center; gap: 10px; }
.sidebar { border-right: 1px solid var(--line); background: var(--panel); padding: 22px; position: sticky; top: 0; height: 100vh; }
.sidebar nav { display: grid; gap: 8px; margin-top: 34px; }
.nav-link { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; color: var(--muted); font-weight: 750; }
.nav-link.active, .nav-link:hover { background: color-mix(in srgb, var(--primary), transparent 88%); color: var(--primary); }
.mobile-nav { display: none; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 22px 0; }
.metric-card { display: grid; gap: 8px; }
.metric-card svg { color: var(--primary); }
.metric-card strong { font-size: 1.35rem; }
.card-grid, .member-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.group-card { min-height: 150px; display: grid; align-content: space-between; transition: transform 160ms ease, border-color 160ms ease; }
.group-card:hover { transform: translateY(-2px); border-color: var(--primary); }
.group-hero { background: var(--panel); border: 1px solid var(--line); border-radius: 22px; padding: 22px; box-shadow: var(--shadow); margin-bottom: 18px; }
.hero-actions { margin-left: auto; }
.list-panel { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 8px 16px; }
.list-row span { display: grid; gap: 4px; }
.list-row small { color: var(--muted); }
.chart-box { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px; min-height: 260px; }
.auth-page { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr); }
.auth-panel { display: flex; flex-direction: column; justify-content: center; width: min(420px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0; }
.auth-panel h1 { margin: 42px 0 8px; font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.05em; }
.auth-panel > p { color: var(--muted); margin-bottom: 28px; }
.auth-preview { display: grid; place-items: center; padding: 40px; background: linear-gradient(145deg, color-mix(in srgb, var(--primary), transparent 82%), var(--paper)); }
.auth-form, .stack-form { display: grid; gap: 16px; }
.switch-auth { color: var(--muted); text-align: center; }
.switch-auth a, .form-row a { color: var(--primary); font-weight: 800; }
.password-row { position: relative; }
.password-toggle { position: absolute; right: 10px; top: 33px; border: 0; background: transparent; color: var(--muted); padding: 8px; }
.success-box { background: color-mix(in srgb, var(--success), transparent 86%); color: var(--success); border: 1px solid color-mix(in srgb, var(--success), transparent 72%); border-radius: var(--radius); padding: 14px; }
.form-error, .field-error { color: var(--danger); }
.field-wrap { display: grid; gap: 7px; }
.field-label { font-weight: 800; font-size: 0.9rem; }
.field-helper { color: var(--muted); }
.input, .compact-select { width: 100%; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 12px 13px; }
.input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary), transparent 86%); outline: none; }
.input-error { border-color: var(--danger); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-row, .add-person-row { display: flex; align-items: end; justify-content: space-between; gap: 12px; }
.check-row { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); }
.chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; background: var(--panel-strong); padding: 8px 10px; font-weight: 750; }
.chip button { border: 0; background: transparent; color: var(--muted); display: grid; }
.participant-box { display: grid; gap: 10px; border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; background: var(--panel); }
.participant-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mini-input { max-width: 96px; border: 1px solid var(--line); border-radius: 10px; background: var(--paper); color: var(--ink); padding: 8px; }
.summary-line { color: var(--muted); font-weight: 750; }
.not-found { text-align: center; background: var(--panel); border: 1px solid var(--line); border-radius: 22px; padding: 32px; box-shadow: var(--shadow); }
`);

write("client/src/styles/components.css", `.btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent; border-radius: 12px; padding: 0 16px; font-weight: 800; transition: transform 150ms ease, background 150ms ease, border-color 150ms ease; }
.btn:hover { transform: translateY(-1px); }
.btn:disabled { cursor: not-allowed; opacity: 0.65; transform: none; }
.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--panel); border-color: var(--line); color: var(--ink); }
.btn-ghost { background: transparent; color: var(--muted); }
.btn-danger { background: var(--danger); color: white; }
.icon-btn { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--line); background: var(--panel); color: var(--ink); }
.spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; animation: spin 0.8s linear infinite; }
.loader { display: inline-flex; gap: 10px; align-items: center; color: var(--muted); font-weight: 800; }
.avatar { width: 42px; height: 42px; display: inline-grid; place-items: center; border-radius: 14px; background: var(--primary); color: white; font-weight: 900; flex: 0 0 auto; }
.badge { display: inline-flex; width: fit-content; border-radius: 999px; padding: 5px 9px; font-size: 0.78rem; font-weight: 850; }
.badge-neutral { background: var(--panel-strong); color: var(--muted); }
.badge-success { background: color-mix(in srgb, var(--success), transparent 86%); color: var(--success); }
.badge-warning { background: color-mix(in srgb, var(--warning), transparent 86%); color: var(--warning); }
.modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; background: rgba(10, 14, 25, 0.52); padding: 18px; }
.modal-panel { width: min(720px, 100%); max-height: min(88vh, 820px); overflow: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 22px; box-shadow: var(--shadow); padding: 20px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
.modal-header h2 { margin: 0; }
.modal-actions { display: flex; justify-content: end; gap: 10px; margin-top: 18px; }
.collapsible { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); margin-top: 14px; overflow: hidden; }
.collapsible-trigger { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 14px; align-items: center; border: 0; background: transparent; color: var(--ink); padding: 16px; text-align: left; }
.collapsible-title { display: flex; align-items: center; gap: 10px; font-weight: 900; }
.collapsible-summary { color: var(--muted); font-size: 0.9rem; }
.collapsible-body { border-top: 1px solid var(--line); padding: 16px; }
.count-pill { min-width: 24px; height: 24px; display: inline-grid; place-items: center; border-radius: 999px; background: var(--panel-strong); color: var(--muted); font-size: 0.75rem; }
.rotate { transform: rotate(180deg); }
.toast-stack { position: fixed; z-index: 80; right: 16px; bottom: 16px; display: grid; gap: 10px; }
.toast { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--success); color: var(--ink); box-shadow: var(--shadow); padding: 12px 14px; border-radius: 12px; font-weight: 750; }
.toast-error { border-left-color: var(--danger); }
.empty-state, .error-state { border: 1px dashed var(--line); border-radius: var(--radius); padding: 24px; text-align: center; background: color-mix(in srgb, var(--panel), transparent 18%); }
.skeleton { min-height: 24px; border-radius: 10px; background: linear-gradient(90deg, var(--panel-strong), var(--line), var(--panel-strong)); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
`);

write("client/src/styles/animations.css", `@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
`);

write("client/src/styles/responsive.css", `@media (max-width: 920px) {
  .landing-header nav a:not(.btn) { display: none; }
  .hero, .auth-page { grid-template-columns: 1fr; }
  .auth-preview { display: none; }
  .feature-grid, .workflow ol, .metric-grid { grid-template-columns: 1fr; }
  .app-shell { display: block; }
  .sidebar { display: none; }
  .topbar { padding: 12px 16px; }
  .topbar-actions .btn span, .compact-select { display: none; }
  .mobile-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 30; display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; padding: 8px max(8px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-bottom)); background: var(--panel); border-top: 1px solid var(--line); }
  .mobile-nav-link { min-height: 50px; display: grid; place-items: center; gap: 2px; color: var(--muted); font-size: 0.75rem; font-weight: 800; border-radius: 12px; }
  .mobile-nav-link.active { color: var(--primary); background: color-mix(in srgb, var(--primary), transparent 88%); }
  .group-hero, .page-title-row, .card-header { align-items: start; flex-direction: column; }
  .hero-actions, .form-row, .add-person-row { width: 100%; flex-direction: column; align-items: stretch; }
  .form-grid { grid-template-columns: 1fr; }
  .collapsible-trigger { grid-template-columns: 1fr auto; }
  .collapsible-summary { grid-column: 1 / -1; }
}
@media (max-width: 520px) {
  .landing-header { padding-inline: 12px; }
  .landing-header .btn-secondary { display: none; }
  .hero { padding-top: 42px; }
  .hero h1 { font-size: 2.8rem; }
  .page-container { width: min(100% - 20px, 1180px); }
  .modal-backdrop { align-items: end; padding: 0; }
  .modal-panel { max-height: 92vh; border-radius: 22px 22px 0 0; }
}
`);

write("client/src/tests/calculations.test.js", `import { describe, expect, it } from "vitest";
import { splitExpense, calculateBalances } from "../utils/calculations.js";
import { toMinorUnits } from "../utils/currency.js";

describe("client calculation helpers", () => {
  it("converts rupees to integer paise", () => {
    expect(toMinorUnits("100.50")).toBe(10050);
  });

  it("splits equal expenses with a rounding remainder", () => {
    const split = splitExpense(100, "equal", [{ memberId: "a" }, { memberId: "b" }, { memberId: "c" }]);
    expect(split.reduce((sum, item) => sum + item.shareMinor, 0)).toBe(100);
  });

  it("keeps balances at zero after a completed settlement", () => {
    const members = [{ _id: "a" }, { _id: "b" }, { _id: "c" }];
    const expenses = [{ paidBy: "a", amountMinor: 3000, participants: [{ memberId: "a", shareMinor: 1000 }, { memberId: "b", shareMinor: 1000 }, { memberId: "c", shareMinor: 1000 }] }];
    const settlements = [{ fromMember: "b", toMember: "a", amountMinor: 1000, status: "completed" }];
    const balances = calculateBalances(members, expenses, settlements);
    expect(balances.reduce((sum, item) => sum + item.netMinor, 0)).toBe(0);
  });
});
`);

write("server/package.json", `{
  "name": "splitmate-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "build": "node scripts/lint.js",
    "lint": "node scripts/lint.js",
    "test": "vitest run",
    "seed": "node scripts/seed.js",
    "load:test": "node scripts/load-test.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.5",
    "nodemailer": "^7.0.11"
  },
  "devDependencies": {
    "vitest": "^4.1.0"
  }
}
`);

write("server/.env.example", `PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/splitmate
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-another-32-random-characters
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_DOMAIN=

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=SplitMate <no-reply@example.com>
`);

write("server/config/env.js", `import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
function readSecret(key, fallback) {
  const value = process.env[key] || fallback;
  if (isProduction && (!value || value.includes("replace-with") || value.includes("development"))) {
    throw new Error(key + " must be set to a strong production secret.");
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT_ACCESS_SECRET: readSecret("JWT_ACCESS_SECRET", "development-access-secret-change-this-value"),
  JWT_REFRESH_SECRET: readSecret("JWT_REFRESH_SECRET", "development-refresh-secret-change-this-value"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || "SplitMate <no-reply@example.com>",
};

export const isProd = env.NODE_ENV === "production";
`);

write("server/config/db.js", `import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Add it to server/.env or your Render environment.");
  }
  mongoose.set("strictQuery", true);
  mongoose.connection.on("connected", () => console.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
  mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error.message));
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
}

export async function closeDatabase() {
  await mongoose.connection.close();
}
`);

write("server/config/cookies.js", `import { env, isProd } from "./env.js";

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

export const accessCookie = {
  ...baseCookie,
  maxAge: 15 * 60 * 1000,
};

export function refreshCookie(remember = false) {
  return {
    ...baseCookie,
    path: "/api/auth",
    maxAge: (remember ? 30 : 7) * 24 * 60 * 60 * 1000,
  };
}

export function clearAuthCookies(res) {
  res.clearCookie("sm_access", accessCookie);
  res.clearCookie("sm_refresh", { ...baseCookie, path: "/api/auth" });
}
`);

write("server/utils/ApiError.js", `export default class ApiError extends Error {
  constructor(statusCode, message, errors = [], code = "REQUEST_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
  }
}
`);

write("server/utils/asyncHandler.js", `export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
`);

write("server/utils/response.js", `export function success(res, message, data = {}, status = 200) {
  return res.status(status).json({ success: true, message, data });
}
`);

write("server/utils/currency.js", `import ApiError from "./ApiError.js";

export function toMinorUnits(value) {
  if (Number.isInteger(value) && value > 0) return value;
  const raw = String(value ?? "").trim();
  if (!/^\\d+(\\.\\d{1,2})?$/.test(raw)) {
    throw new ApiError(422, "Amount can have at most two decimal places.", [{ field: "amount", message: "Enter a valid amount." }]);
  }
  const [major, minor = ""] = raw.split(".");
  const amount = Number(major) * 100 + Number(minor.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new ApiError(422, "Amount must be greater than zero.", [{ field: "amount", message: "Amount must be greater than zero." }]);
  }
  return amount;
}

export function fromMinorUnits(amountMinor) {
  return (Number(amountMinor || 0) / 100).toFixed(2);
}
`);

write("server/utils/calculations.js", `import ApiError from "./ApiError.js";

function distribute(amountMinor, weighted) {
  const total = weighted.reduce((sum, row) => sum + row.weight, 0);
  if (total <= 0) throw new ApiError(422, "At least one positive share is required.");
  const rows = weighted.map((row) => {
    const raw = (amountMinor * row.weight) / total;
    const floor = Math.floor(raw);
    return { ...row, floor, remainder: raw - floor };
  }).sort((a, b) => b.remainder - a.remainder || String(a.memberId).localeCompare(String(b.memberId)));
  let left = amountMinor - rows.reduce((sum, row) => sum + row.floor, 0);
  return rows.map((row) => ({ memberId: row.memberId, shareMinor: row.floor + (left-- > 0 ? 1 : 0) }));
}

export function splitExpense(amountMinor, splitMethod, participants) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new ApiError(422, "Amount must be greater than zero.");
  const included = participants.filter((participant) => participant.included !== false);
  if (!included.length) throw new ApiError(422, "Choose at least one participant.");
  const unique = new Set(included.map((item) => String(item.memberId)));
  if (unique.size !== included.length) throw new ApiError(422, "Each participant can appear only once.");
  if (splitMethod === "equal") return distribute(amountMinor, included.map((item) => ({ memberId: item.memberId, weight: 1 })));
  if (splitMethod === "shares") {
    if (included.some((item) => !Number.isFinite(Number(item.shares)) || Number(item.shares) <= 0)) throw new ApiError(422, "Shares must be positive.");
    return distribute(amountMinor, included.map((item) => ({ memberId: item.memberId, weight: Number(item.shares) })));
  }
  if (splitMethod === "percentage") {
    const total = included.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.001) throw new ApiError(422, "Percentages must total 100%.");
    return distribute(amountMinor, included.map((item) => ({ memberId: item.memberId, weight: Number(item.percentage || 0) })));
  }
  const exactTotal = included.reduce((sum, item) => sum + Number(item.exactMinor || 0), 0);
  if (exactTotal !== amountMinor) throw new ApiError(422, "Exact amounts must equal the expense total.");
  return included.map((item) => ({ memberId: item.memberId, shareMinor: Number(item.exactMinor) }));
}

export function calculateMemberBalances(members, expenses, settlements = []) {
  const totals = new Map(members.map((member) => [String(member._id), {
    member,
    paidMinor: 0,
    shareMinor: 0,
    netMinor: 0,
    owes: [],
    owedBy: [],
  }]));
  for (const expense of expenses.filter((item) => !item.deletedAt)) {
    const payer = totals.get(String(expense.paidBy));
    if (payer) payer.paidMinor += expense.amountMinor;
    for (const participant of expense.participants) {
      const row = totals.get(String(participant.memberId));
      if (row) row.shareMinor += participant.shareMinor;
    }
  }
  for (const row of totals.values()) row.netMinor = row.paidMinor - row.shareMinor;
  for (const settlement of settlements.filter((item) => item.status === "completed")) {
    const from = totals.get(String(settlement.fromMember));
    const to = totals.get(String(settlement.toMember));
    if (from) from.netMinor += settlement.amountMinor;
    if (to) to.netMinor -= settlement.amountMinor;
  }
  const balances = [...totals.values()];
  const suggestions = generateSettlementSuggestions(balances.map((row) => ({ memberId: String(row.member._id), amountMinor: row.netMinor })));
  for (const suggestion of suggestions) {
    const from = totals.get(String(suggestion.fromMember));
    const to = totals.get(String(suggestion.toMember));
    if (from) from.owes.push(suggestion);
    if (to) to.owedBy.push(suggestion);
  }
  return { balances, suggestions };
}

export function generateSettlementSuggestions(balances) {
  const debtors = balances.filter((item) => item.amountMinor < 0).map((item) => ({ ...item, amountMinor: -item.amountMinor })).sort((a, b) => b.amountMinor - a.amountMinor || String(a.memberId).localeCompare(String(b.memberId)));
  const creditors = balances.filter((item) => item.amountMinor > 0).map((item) => ({ ...item })).sort((a, b) => b.amountMinor - a.amountMinor || String(a.memberId).localeCompare(String(b.memberId)));
  const suggestions = [];
  let debtor = 0;
  let creditor = 0;
  while (debtor < debtors.length && creditor < creditors.length) {
    const amountMinor = Math.min(debtors[debtor].amountMinor, creditors[creditor].amountMinor);
    if (amountMinor > 0) suggestions.push({ fromMember: debtors[debtor].memberId, toMember: creditors[creditor].memberId, amountMinor });
    debtors[debtor].amountMinor -= amountMinor;
    creditors[creditor].amountMinor -= amountMinor;
    if (debtors[debtor].amountMinor === 0) debtor++;
    if (creditors[creditor].amountMinor === 0) creditor++;
  }
  return suggestions;
}
`);

write("server/models/User.js", `import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  avatar: String,
  defaultCurrency: { type: String, default: "INR", uppercase: true },
  themePreference: { type: String, enum: ["light", "dark", "system"], default: "system" },
}, { timestamps: true });

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
`);

write("server/models/Group.js", `import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 240, default: "" },
  type: { type: String, enum: ["Home", "Trip", "Friends", "Couple", "Office", "Other"], default: "Other", index: true },
  currency: { type: String, default: "INR", uppercase: true },
  icon: { type: String, default: "users" },
  colour: { type: String, default: "#4f46e5" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  archived: { type: Boolean, default: false, index: true },
}, { timestamps: true });

groupSchema.index({ createdBy: 1, archived: 1 });
export default mongoose.model("Group", groupSchema);
`);

write("server/models/Member.js", `import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, maxlength: 160 },
  isGuest: { type: Boolean, default: true, index: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

memberSchema.index({ groupId: 1, userId: 1 }, { unique: true, sparse: true });
memberSchema.index({ groupId: 1, active: 1, displayName: 1 });
export default mongoose.model("Member", memberSchema);
`);

write("server/models/Expense.js", `import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  shareMinor: { type: Number, required: true, min: 0 },
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  amountMinor: { type: Number, required: true, min: 1 },
  category: { type: String, required: true, index: true },
  expenseDate: { type: Date, required: true, index: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  participants: { type: [participantSchema], validate: (items) => items.length > 0 },
  splitMethod: { type: String, enum: ["equal", "exact", "percentage", "shares"], default: "equal" },
  splitDetails: Object,
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: Date,
}, { timestamps: true });

expenseSchema.index({ groupId: 1, expenseDate: -1 });
expenseSchema.index({ groupId: 1, category: 1 });
export default mongoose.model("Expense", expenseSchema);
`);

write("server/models/Settlement.js", `import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  fromMember: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  toMember: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  amountMinor: { type: Number, required: true, min: 1 },
  method: { type: String, enum: ["cash", "upi", "bank", "card", "other"], default: "upi" },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending", index: true },
  note: { type: String, trim: true, maxlength: 300, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  completedAt: Date,
}, { timestamps: true });

settlementSchema.index({ groupId: 1, status: 1 });
settlementSchema.index({ fromMember: 1, toMember: 1, groupId: 1 });
export default mongoose.model("Settlement", settlementSchema);
`);

write("server/models/Activity.js", `import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: mongoose.Schema.Types.ObjectId,
  message: { type: String, required: true, maxlength: 240 },
  metadata: Object,
}, { timestamps: true });

activitySchema.index({ groupId: 1, createdAt: -1 });
export default mongoose.model("Activity", activitySchema);
`);

write("server/models/RefreshSession.js", `import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  tokenIdHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: Date,
}, { timestamps: true });

export default mongoose.model("RefreshSession", refreshSessionSchema);
`);

write("server/models/PasswordResetToken.js", `import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  usedAt: Date,
}, { timestamps: true });

export default mongoose.model("PasswordResetToken", passwordResetTokenSchema);
`);

write("server/services/tokenService.js", `import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import RefreshSession from "../models/RefreshSession.js";

const issuer = "splitmate-api";
const audience = "splitmate-client";
export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId, remember = false) {
  const jti = crypto.randomUUID();
  const accessToken = jwt.sign({ sub: String(userId) }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN, issuer, audience });
  const refreshToken = jwt.sign({ sub: String(userId), jti }, env.JWT_REFRESH_SECRET, { expiresIn: remember ? "30d" : env.REFRESH_TOKEN_EXPIRES_IN, issuer, audience });
  const decoded = jwt.decode(refreshToken);
  await RefreshSession.create({
    userId,
    tokenHash: hashToken(refreshToken),
    tokenIdHash: hashToken(jti),
    expiresAt: new Date(decoded.exp * 1000),
  });
  return { accessToken, refreshToken };
}

export function verifyAccess(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer, audience });
}

export async function rotateRefresh(refreshToken, remember = false) {
  const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, { issuer, audience });
  const session = await RefreshSession.findOne({ tokenHash: hashToken(refreshToken), userId: payload.sub });
  if (session?.revokedAt) {
    await RefreshSession.updateMany({ userId: payload.sub, revokedAt: { $exists: false } }, { revokedAt: new Date() });
    throw new Error("Refresh token reuse detected");
  }
  if (!session || session.expiresAt < new Date()) throw new Error("Refresh token expired");
  session.revokedAt = new Date();
  await session.save();
  return createSession(payload.sub, remember);
}

export async function revokeRefresh(refreshToken) {
  if (!refreshToken) return;
  await RefreshSession.updateOne({ tokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
}

export async function revokeAll(userId) {
  await RefreshSession.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
}

export async function createPasswordReset(userId) {
  await PasswordResetToken.deleteMany({ userId });
  const token = crypto.randomBytes(32).toString("base64url");
  await PasswordResetToken.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return token;
}
`);

write("server/services/emailService.js", `import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function configured() {
  return Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS);
}

export async function sendEmail({ to, subject, html, text }) {
  if (!configured()) {
    console.warn("Email is disabled. Message for", to, "subject:", subject, "text:", text);
    return { disabled: true };
  }
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });
  return transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
}

export function actionEmail(message, url) {
  return {
    text: message + "\\n" + url,
    html: "<p>" + message + "</p><p><a href=\\"" + url + "\\">Open SplitMate</a></p>",
  };
}
`);

write("server/services/activityService.js", `import Activity from "../models/Activity.js";

export async function recordActivity(groupId, actor, action, entityType, entityId, message, metadata = {}) {
  return Activity.create({ groupId, actor, action, entityType, entityId, message, metadata });
}
`);

write("server/services/balanceService.js", `import Expense from "../models/Expense.js";
import Member from "../models/Member.js";
import Settlement from "../models/Settlement.js";
import { calculateMemberBalances } from "../utils/calculations.js";

export async function balancesForGroup(groupId) {
  const [members, expenses, settlements] = await Promise.all([
    Member.find({ groupId, active: true }).sort({ createdAt: 1 }).lean(),
    Expense.find({ groupId, deletedAt: { $exists: false } }).sort({ expenseDate: -1 }).lean(),
    Settlement.find({ groupId }).lean(),
  ]);
  const result = calculateMemberBalances(members, expenses, settlements);
  const totalSpentMinor = expenses.reduce((sum, expense) => sum + expense.amountMinor, 0);
  return { ...result, totalSpentMinor, members, expenses, settlements };
}
`);

write("server/middleware/authMiddleware.js", `import ApiError from "../utils/ApiError.js";
import { verifyAccess } from "../services/tokenService.js";
import User from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies.sm_access || req.get("authorization")?.replace(/^Bearer\\s+/i, "");
    if (!token) throw new Error("Missing token");
    const payload = verifyAccess(token);
    if (!payload.sub) throw new Error("Missing subject");
    const user = await User.findById(payload.sub);
    if (!user) throw new Error("Missing user");
    req.userId = String(user._id);
    req.user = user;
    next();
  } catch {
    next(new ApiError(401, "Please sign in again.", [], "UNAUTHORIZED"));
  }
}
`);

write("server/middleware/groupAccessMiddleware.js", `import Member from "../models/Member.js";
import ApiError from "../utils/ApiError.js";

export async function requireGroupMember(req, _res, next) {
  const groupId = req.params.groupId;
  const member = await Member.findOne({ groupId, userId: req.userId, active: true });
  if (!member) return next(new ApiError(403, "You do not have access to this group.", [], "FORBIDDEN"));
  req.currentMember = member;
  next();
}

export function requireGroupManager(req, _res, next) {
  if (!["owner", "admin"].includes(req.currentMember?.role)) {
    return next(new ApiError(403, "Only group admins can do that.", [], "FORBIDDEN"));
  }
  next();
}
`);

write("server/middleware/errorMiddleware.js", `import { isProd } from "../config/env.js";

export function notFound(_req, res) {
  res.status(404).json({ success: false, message: "Route not found.", errors: [] });
}

export function errorMiddleware(error, _req, res, _next) {
  if (error?.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors: Object.entries(error.errors || {}).map(([field, value]) => ({ field, message: value.message })),
    });
  }
  if (error?.name === "CastError") {
    return res.status(404).json({ success: false, message: "Resource not found.", errors: [] });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: "That record already exists.", errors: [] });
  }
  const status = error.statusCode || 500;
  const message = status === 500 && isProd ? "Something went wrong." : error.message || "Something went wrong.";
  if (status === 500) console.error(error);
  return res.status(status).json({ success: false, message, errors: error.errors || [] });
}
`);

write("server/middleware/validateRequest.js", `import ApiError from "../utils/ApiError.js";

export function validateBody(rules) {
  return (req, _res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      const message = rule(value, req.body);
      if (message) errors.push({ field, message });
    }
    if (errors.length) return next(new ApiError(422, "Please check the form.", errors, "VALIDATION_ERROR"));
    next();
  };
}

export const isEmail = (value) => /^\\S+@\\S+\\.\\S+$/.test(String(value || "").trim());
export const required = (label) => (value) => String(value || "").trim() ? "" : label + " is required.";
`);

write("server/middleware/rateLimiters.js", `import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
`);

write("server/validators/authValidators.js", `import { isEmail } from "../middleware/validateRequest.js";

export const registerRules = {
  name: (value) => String(value || "").trim().length >= 2 ? "" : "Name must be at least 2 characters.",
  email: (value) => isEmail(value) ? "" : "Enter a valid email.",
  password: (value) => String(value || "").length >= 8 ? "" : "Password must be at least 8 characters.",
  confirmPassword: (value, body) => value === body.password ? "" : "Passwords do not match.",
};

export const loginRules = {
  email: (value) => isEmail(value) ? "" : "Enter a valid email.",
  password: (value) => String(value || "").length ? "" : "Password is required.",
};

export const passwordRules = {
  currentPassword: (value) => String(value || "").length ? "" : "Current password is required.",
  newPassword: (value) => String(value || "").length >= 8 ? "" : "New password must be at least 8 characters.",
  confirmPassword: (value, body) => value === body.newPassword ? "" : "Passwords do not match.",
};
`);

write("server/validators/groupValidators.js", `export const groupRules = {
  name: (value) => String(value || "").trim() ? "" : "Group name is required.",
};
`);

write("server/validators/expenseValidators.js", `export const expenseRules = {
  title: (value) => String(value || "").trim() ? "" : "Expense title is required.",
  paidBy: (value) => value ? "" : "Choose who paid.",
};
`);

write("server/validators/settlementValidators.js", `export const settlementRules = {
  fromMember: (value) => value ? "" : "Choose who is paying.",
  toMember: (value, body) => value && value !== body.fromMember ? "" : "Choose two different people.",
  amountMinor: (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? "" : "Amount must be greater than zero.",
};
`);

write("server/controllers/authController.js", `import crypto from "node:crypto";
import PasswordResetToken from "../models/PasswordResetToken.js";
import User from "../models/User.js";
import { accessCookie, clearAuthCookies, refreshCookie } from "../config/cookies.js";
import { env } from "../config/env.js";
import { actionEmail, sendEmail } from "../services/emailService.js";
import { createPasswordReset, createSession, hashPassword, hashToken, revokeAll, revokeRefresh, rotateRefresh, verifyPassword } from "../services/tokenService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  defaultCurrency: user.defaultCurrency,
  themePreference: user.themePreference,
});

function setSessionCookies(res, session, remember = false) {
  res.cookie("sm_access", session.accessToken, accessCookie);
  res.cookie("sm_refresh", session.refreshToken, refreshCookie(remember));
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(409, "An account with this email already exists.", [{ field: "email", message: "Email already registered." }]);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    passwordHash: await hashPassword(req.body.password),
    defaultCurrency: req.body.defaultCurrency || "INR",
  });
  const session = await createSession(user._id);
  setSessionCookies(res, session);
  success(res, "Account created.", { user: publicUser(user) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
  if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password.", [], "INVALID_CREDENTIALS");
  }
  const session = await createSession(user._id, Boolean(req.body.remember));
  setSessionCookies(res, session, Boolean(req.body.remember));
  success(res, "Signed in.", { user: publicUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const session = await rotateRefresh(req.cookies.sm_refresh);
    setSessionCookies(res, session);
    const user = await User.findById(JSON.parse(Buffer.from(session.accessToken.split(".")[1], "base64url").toString()).sub);
    success(res, "Session refreshed.", { user: user ? publicUser(user) : null });
  } catch {
    clearAuthCookies(res);
    throw new ApiError(401, "Session expired.", [], "UNAUTHORIZED");
  }
});

export const logout = asyncHandler(async (req, res) => {
  await revokeRefresh(req.cookies.sm_refresh);
  clearAuthCookies(res);
  success(res, "Logged out.");
});

export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAll(req.userId);
  clearAuthCookies(res);
  success(res, "All sessions logged out.");
});

export const me = asyncHandler(async (req, res) => {
  success(res, "Current user.", { user: publicUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = await createPasswordReset(user._id);
    const url = env.CLIENT_URL.replace(/\\/$/, "") + "/reset-password?token=" + token;
    await sendEmail({ to: user.email, subject: "Reset your SplitMate password", ...actionEmail("Use this secure link to reset your password.", url) });
  }
  success(res, "If that email exists, a reset link has been sent.");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const record = await PasswordResetToken.findOne({ tokenHash: hashToken(req.body.token), expiresAt: { $gt: new Date() }, usedAt: { $exists: false } });
  if (!record) throw new ApiError(400, "Reset link is invalid or expired.");
  const user = await User.findById(record.userId).select("+passwordHash");
  if (!user) throw new ApiError(400, "Reset link is invalid or expired.");
  user.passwordHash = await hashPassword(req.body.password);
  await user.save();
  record.usedAt = new Date();
  await record.save();
  await revokeAll(user._id);
  const session = await createSession(user._id);
  setSessionCookies(res, session);
  success(res, "Password reset.", { user: publicUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("+passwordHash");
  if (!(await verifyPassword(req.body.currentPassword, user.passwordHash))) throw new ApiError(400, "Current password is incorrect.");
  user.passwordHash = await hashPassword(req.body.newPassword);
  await user.save();
  await revokeAll(user._id);
  const session = await createSession(user._id);
  setSessionCookies(res, session);
  success(res, "Password changed.", { user: publicUser(user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = {
    name: req.body.name,
    defaultCurrency: req.body.defaultCurrency,
    themePreference: req.body.themePreference,
  };
  const user = await User.findByIdAndUpdate(req.userId, { $set: allowed }, { new: true, runValidators: true });
  success(res, "Profile updated.", { user: publicUser(user) });
});
`);

write("server/controllers/groupController.js", `import Activity from "../models/Activity.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import Member from "../models/Member.js";
import Settlement from "../models/Settlement.js";
import { recordActivity } from "../services/activityService.js";
import { balancesForGroup } from "../services/balanceService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { splitExpense } from "../utils/calculations.js";
import { toMinorUnits } from "../utils/currency.js";
import { success } from "../utils/response.js";

const cleanName = (value) => String(value || "").trim().replace(/\\s+/g, " ");
async function activeMemberIds(groupId) {
  const members = await Member.find({ groupId, active: true }).lean();
  return new Set(members.map((member) => String(member._id)));
}
async function ensureUniqueName(groupId, displayName, excludeId) {
  const existing = await Member.findOne({ groupId, active: true, displayName: new RegExp("^" + escapeRegExp(displayName) + "$", "i") });
  if (existing && String(existing._id) !== String(excludeId || "")) throw new ApiError(409, "That name is already in this group.");
}
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
}

export const listGroups = asyncHandler(async (req, res) => {
  const memberships = await Member.find({ userId: req.userId, active: true }).lean();
  const groupIds = memberships.map((member) => member.groupId);
  const groups = await Group.find({ _id: { $in: groupIds } }).sort({ updatedAt: -1 }).lean();
  const enriched = await Promise.all(groups.map(async (group) => ({
    ...group,
    memberCount: await Member.countDocuments({ groupId: group._id, active: true }),
    totalSpentMinor: (await Expense.aggregate([{ $match: { groupId: group._id, deletedAt: { $exists: false } } }, { $group: { _id: null, total: { $sum: "$amountMinor" } } }]))[0]?.total || 0,
  })));
  success(res, "Groups loaded.", { groups: enriched });
});

export const createGroup = asyncHandler(async (req, res) => {
  const group = await Group.create({
    name: cleanName(req.body.name),
    description: req.body.description,
    type: req.body.type || "Other",
    currency: req.body.currency || req.user.defaultCurrency || "INR",
    colour: req.body.colour || "#4f46e5",
    createdBy: req.userId,
  });
  await Member.create({ groupId: group._id, userId: req.userId, displayName: req.user.name, email: req.user.email, isGuest: false, role: "owner", addedBy: req.userId });
  const seen = new Set([req.user.name.toLowerCase()]);
  for (const person of req.body.members || []) {
    const displayName = cleanName(person.displayName || person.name);
    if (!displayName) continue;
    const key = displayName.toLowerCase();
    if (seen.has(key)) throw new ApiError(409, "Duplicate member name: " + displayName);
    seen.add(key);
    await Member.create({ groupId: group._id, displayName, email: person.email || undefined, isGuest: true, role: "member", addedBy: req.userId });
  }
  await recordActivity(group._id, req.userId, "group.created", "Group", group._id, "Created group " + group.name);
  success(res, "Group created.", { group }, 201);
});

export const getGroup = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId).lean();
  if (!group) throw new ApiError(404, "Group not found.");
  const [members, expenses, settlements, activity, balanceData] = await Promise.all([
    Member.find({ groupId, active: true }).sort({ createdAt: 1 }).lean(),
    Expense.find({ groupId, deletedAt: { $exists: false } }).sort({ expenseDate: -1, createdAt: -1 }).limit(100).lean(),
    Settlement.find({ groupId }).sort({ createdAt: -1 }).limit(100).lean(),
    Activity.find({ groupId }).sort({ createdAt: -1 }).limit(100).lean(),
    balancesForGroup(groupId),
  ]);
  success(res, "Group loaded.", { group, members, expenses, settlements, activity, balances: balanceData.balances, suggestions: balanceData.suggestions, totalSpentMinor: balanceData.totalSpentMinor });
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByIdAndUpdate(req.params.groupId, { $set: req.body }, { new: true, runValidators: true });
  await recordActivity(group._id, req.userId, "group.updated", "Group", group._id, "Updated group settings");
  success(res, "Group updated.", { group });
});

export const archiveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByIdAndUpdate(req.params.groupId, { archived: true }, { new: true });
  await recordActivity(group._id, req.userId, "group.archived", "Group", group._id, "Archived group");
  success(res, "Group archived.", { group });
});

export const addMember = asyncHandler(async (req, res) => {
  const displayName = cleanName(req.body.displayName || req.body.name);
  if (!displayName) throw new ApiError(422, "Name is required.");
  await ensureUniqueName(req.params.groupId, displayName);
  const member = await Member.create({ groupId: req.params.groupId, displayName, email: req.body.email || undefined, isGuest: true, addedBy: req.userId });
  await recordActivity(req.params.groupId, req.userId, "member.added", "Member", member._id, "Added " + member.displayName);
  success(res, "Person added.", { member }, 201);
});

export const updateMember = asyncHandler(async (req, res) => {
  if (req.body.displayName) await ensureUniqueName(req.params.groupId, cleanName(req.body.displayName), req.params.memberId);
  const member = await Member.findOneAndUpdate({ _id: req.params.memberId, groupId: req.params.groupId }, { $set: req.body }, { new: true, runValidators: true });
  if (!member) throw new ApiError(404, "Member not found.");
  success(res, "Member updated.", { member });
});

export const removeMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.memberId, groupId: req.params.groupId });
  if (!member || member.role === "owner") throw new ApiError(400, "This member cannot be removed.");
  member.active = false;
  await member.save();
  await recordActivity(req.params.groupId, req.userId, "member.removed", "Member", member._id, "Removed " + member.displayName);
  success(res, "Member removed.", { member });
});

export const listExpenses = asyncHandler(async (req, res) => {
  const query = { groupId: req.params.groupId, deletedAt: { $exists: false } };
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.title = new RegExp(String(req.query.search).replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&"), "i");
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
  const [expenses, total] = await Promise.all([
    Expense.find(query).sort({ expenseDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Expense.countDocuments(query),
  ]);
  success(res, "Expenses loaded.", { expenses, page, total, pages: Math.ceil(total / limit) });
});

export const createExpense = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group || group.archived) throw new ApiError(409, "This group is read-only.");
  const ids = await activeMemberIds(req.params.groupId);
  if (!ids.has(String(req.body.paidBy))) throw new ApiError(422, "Choose a valid payer.");
  const amountMinor = req.body.amountMinor ? Number(req.body.amountMinor) : toMinorUnits(req.body.amount);
  const participants = (req.body.participants || []).filter((item) => item.included !== false).map((item) => {
    if (!ids.has(String(item.memberId))) throw new ApiError(422, "Choose valid participants.");
    return { ...item, exactMinor: item.exactMinor || (item.exact ? toMinorUnits(item.exact) : undefined) };
  });
  const shares = splitExpense(amountMinor, req.body.splitMethod || "equal", participants);
  const expense = await Expense.create({
    groupId: req.params.groupId,
    title: cleanName(req.body.title),
    amountMinor,
    category: req.body.category || "Other",
    expenseDate: req.body.expenseDate || new Date(),
    paidBy: req.body.paidBy,
    participants: shares,
    splitMethod: req.body.splitMethod || "equal",
    splitDetails: req.body.participants,
    notes: req.body.notes || "",
    createdBy: req.userId,
    updatedBy: req.userId,
  });
  await recordActivity(req.params.groupId, req.userId, "expense.created", "Expense", expense._id, "Added " + expense.title);
  success(res, "Expense added.", { expense }, 201);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.expenseId, groupId: req.params.groupId, deletedAt: { $exists: false } });
  if (!expense) throw new ApiError(404, "Expense not found.");
  const amountMinor = req.body.amountMinor ? Number(req.body.amountMinor) : toMinorUnits(req.body.amount || expense.amountMinor);
  const participants = req.body.participants ? splitExpense(amountMinor, req.body.splitMethod || expense.splitMethod, req.body.participants) : expense.participants;
  Object.assign(expense, { ...req.body, amountMinor, participants, updatedBy: req.userId });
  await expense.save();
  await recordActivity(req.params.groupId, req.userId, "expense.updated", "Expense", expense._id, "Updated " + expense.title);
  success(res, "Expense updated.", { expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.expenseId, groupId: req.params.groupId });
  if (!expense) throw new ApiError(404, "Expense not found.");
  expense.deletedAt = new Date();
  expense.updatedBy = req.userId;
  await expense.save();
  await recordActivity(req.params.groupId, req.userId, "expense.deleted", "Expense", expense._id, "Deleted " + expense.title);
  success(res, "Expense deleted.", { expense });
});

export const balances = asyncHandler(async (req, res) => {
  success(res, "Balances loaded.", await balancesForGroup(req.params.groupId));
});

export const listSettlements = asyncHandler(async (req, res) => {
  const settlements = await Settlement.find({ groupId: req.params.groupId }).sort({ createdAt: -1 }).limit(100).lean();
  success(res, "Settlements loaded.", { settlements });
});

export const createSettlement = asyncHandler(async (req, res) => {
  if (String(req.body.fromMember) === String(req.body.toMember)) throw new ApiError(422, "Choose two different people.");
  const ids = await activeMemberIds(req.params.groupId);
  if (!ids.has(String(req.body.fromMember)) || !ids.has(String(req.body.toMember))) throw new ApiError(422, "Choose valid group members.");
  const amountMinor = Number(req.body.amountMinor);
  const settlement = await Settlement.create({
    groupId: req.params.groupId,
    fromMember: req.body.fromMember,
    toMember: req.body.toMember,
    amountMinor,
    method: req.body.method || "upi",
    status: req.body.status || "completed",
    note: req.body.note || "",
    createdBy: req.userId,
    completedAt: (req.body.status || "completed") === "completed" ? new Date() : undefined,
  });
  await recordActivity(req.params.groupId, req.userId, "settlement.created", "Settlement", settlement._id, "Recorded settlement");
  success(res, "Settlement recorded.", { settlement }, 201);
});

export const updateSettlement = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findOneAndUpdate({ _id: req.params.settlementId, groupId: req.params.groupId }, { $set: req.body }, { new: true, runValidators: true });
  if (!settlement) throw new ApiError(404, "Settlement not found.");
  success(res, "Settlement updated.", { settlement });
});

export const activity = asyncHandler(async (req, res) => {
  const rows = await Activity.find({ groupId: req.params.groupId }).sort({ createdAt: -1 }).limit(100).lean();
  success(res, "Activity loaded.", { activity: rows });
});
`);

write("server/controllers/dashboardController.js", `import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import Member from "../models/Member.js";
import { balancesForGroup } from "../services/balanceService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const dashboard = asyncHandler(async (req, res) => {
  const memberships = await Member.find({ userId: req.userId, active: true }).lean();
  const groupIds = memberships.map((member) => member.groupId);
  const groups = await Group.find({ _id: { $in: groupIds }, archived: false }).sort({ updatedAt: -1 }).lean();
  const expenses = await Expense.find({ groupId: { $in: groupIds }, deletedAt: { $exists: false } }).sort({ expenseDate: -1 }).limit(100).lean();
  const userMemberIds = new Set(memberships.map((member) => String(member._id)));
  const summary = {
    totalSpentMinor: expenses.reduce((sum, expense) => sum + expense.amountMinor, 0),
    youPaidMinor: expenses.filter((expense) => userMemberIds.has(String(expense.paidBy))).reduce((sum, expense) => sum + expense.amountMinor, 0),
    yourShareMinor: expenses.reduce((sum, expense) => sum + expense.participants.filter((item) => userMemberIds.has(String(item.memberId))).reduce((inner, item) => inner + item.shareMinor, 0), 0),
    activeGroups: groups.length,
  };
  const categoryMap = new Map();
  for (const expense of expenses) categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amountMinor);
  const enrichedGroups = await Promise.all(groups.map(async (group) => {
    const balanceData = await balancesForGroup(group._id);
    return { ...group, memberCount: balanceData.members.length, totalSpentMinor: balanceData.totalSpentMinor };
  }));
  success(res, "Dashboard loaded.", {
    summary,
    groups: enrichedGroups,
    recentExpenses: expenses.slice(0, 8),
    categorySpending: [...categoryMap].map(([category, amountMinor]) => ({ category, amountMinor })).sort((a, b) => b.amountMinor - a.amountMinor),
  });
});
`);

write("server/routes/authRoutes.js", `import { Router } from "express";
import { changePassword, forgotPassword, login, logout, logoutAll, me, refresh, register, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { authLimiter, passwordLimiter } from "../middleware/rateLimiters.js";
import { validateBody } from "../middleware/validateRequest.js";
import { loginRules, passwordRules, registerRules } from "../validators/authValidators.js";

const router = Router();
router.post("/register", authLimiter, validateBody(registerRules), register);
router.post("/login", authLimiter, validateBody(loginRules), login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.get("/me", requireAuth, me);
router.post("/forgot-password", passwordLimiter, forgotPassword);
router.post("/reset-password", passwordLimiter, resetPassword);
router.post("/change-password", requireAuth, validateBody(passwordRules), changePassword);
export default router;
`);

write("server/routes/userRoutes.js", `import { Router } from "express";
import { updateMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.patch("/me", requireAuth, updateMe);
export default router;
`);

write("server/routes/groupRoutes.js", `import { Router } from "express";
import { activity, addMember, archiveGroup, balances, createExpense, createGroup, createSettlement, deleteExpense, getGroup, listExpenses, listGroups, listSettlements, removeMember, updateExpense, updateGroup, updateMember, updateSettlement } from "../controllers/groupController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireGroupManager, requireGroupMember } from "../middleware/groupAccessMiddleware.js";
import { validateBody } from "../middleware/validateRequest.js";
import { expenseRules } from "../validators/expenseValidators.js";
import { groupRules } from "../validators/groupValidators.js";
import { settlementRules } from "../validators/settlementValidators.js";

const router = Router();
router.use(requireAuth);
router.get("/", listGroups);
router.post("/", validateBody(groupRules), createGroup);
router.get("/:groupId", requireGroupMember, getGroup);
router.patch("/:groupId", requireGroupMember, requireGroupManager, updateGroup);
router.post("/:groupId/archive", requireGroupMember, requireGroupManager, archiveGroup);
router.post("/:groupId/members", requireGroupMember, requireGroupManager, addMember);
router.patch("/:groupId/members/:memberId", requireGroupMember, requireGroupManager, updateMember);
router.delete("/:groupId/members/:memberId", requireGroupMember, requireGroupManager, removeMember);
router.get("/:groupId/expenses", requireGroupMember, listExpenses);
router.post("/:groupId/expenses", requireGroupMember, validateBody(expenseRules), createExpense);
router.patch("/:groupId/expenses/:expenseId", requireGroupMember, updateExpense);
router.delete("/:groupId/expenses/:expenseId", requireGroupMember, deleteExpense);
router.get("/:groupId/balances", requireGroupMember, balances);
router.get("/:groupId/settlements", requireGroupMember, listSettlements);
router.post("/:groupId/settlements", requireGroupMember, validateBody(settlementRules), createSettlement);
router.patch("/:groupId/settlements/:settlementId", requireGroupMember, updateSettlement);
router.get("/:groupId/activity", requireGroupMember, activity);
export default router;
`);

write("server/routes/dashboardRoutes.js", `import { Router } from "express";
import { dashboard } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", requireAuth, dashboard);
export default router;
`);

write("server/app.js", `import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { env, isProd } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorMiddleware, notFound } from "./middleware/errorMiddleware.js";
import { generalLimiter } from "./middleware/rateLimiters.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    const allowed = [env.CLIENT_URL, "http://localhost:5173"];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));
app.use(generalLimiter);
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "SplitMate API is healthy.",
    data: {
      service: "splitmate-api",
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? "connected" : "unavailable",
    },
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/dashboard", dashboardRoutes);

if (isProd) {
  app.get("/", (_req, res) => res.json({ success: true, message: "SplitMate API" }));
}

app.use(notFound);
app.use(errorMiddleware);
export default app;
`);

write("server/server.js", `import app from "./app.js";
import { connectDatabase, closeDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
    console.info("SplitMate API listening on port " + env.PORT);
  });
  const shutdown = async (signal) => {
    console.info(signal + " received. Closing server.");
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Unable to start SplitMate:", error.message);
  process.exit(1);
});
`);

write("server/scripts/lint.js", `import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", "coverage"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\\.(js|mjs)$/.test(entry.name)) files.push(full);
    else if (/\\.(ts|tsx)$/.test(entry.name)) {
      console.error("TypeScript file found:", path.relative(root, full));
      process.exitCode = 1;
    }
  }
}
walk(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exitCode = 1;
  }
}
`);

write("server/scripts/seed.js", `import { closeDatabase, connectDatabase } from "../config/db.js";
import Activity from "../models/Activity.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import Member from "../models/Member.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import RefreshSession from "../models/RefreshSession.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
import { hashPassword } from "../services/tokenService.js";
import { splitExpense } from "../utils/calculations.js";

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed production.");
  await connectDatabase();
  await Promise.all([
    Activity.deleteMany({}),
    Expense.deleteMany({}),
    Settlement.deleteMany({}),
    Member.deleteMany({}),
    Group.deleteMany({}),
    RefreshSession.deleteMany({}),
    PasswordResetToken.deleteMany({}),
    User.deleteMany({}),
  ]);
  const passwordHash = await hashPassword("Demo@12345");
  const demo = await User.create({ name: "Demo User", email: "demo@splitmate.app", passwordHash, defaultCurrency: "INR" });
  const groups = await Group.create([
    { name: "Goa Trip", type: "Trip", currency: "INR", description: "Beach weekend with friends.", createdBy: demo._id, colour: "#4f46e5" },
    { name: "Flatmates", type: "Home", currency: "INR", description: "Rent, bills, groceries.", createdBy: demo._id, colour: "#12856f" },
    { name: "Office Lunch", type: "Office", currency: "INR", description: "Daily lunch rotation.", createdBy: demo._id, colour: "#ad6b12" },
  ]);
  for (const group of groups) {
    const [jainik, rahul, priya, dev] = await Member.create([
      { groupId: group._id, userId: demo._id, displayName: "Jainik", email: demo.email, isGuest: false, role: "owner", addedBy: demo._id },
      { groupId: group._id, displayName: "Rahul", isGuest: true, addedBy: demo._id },
      { groupId: group._id, displayName: "Priya", isGuest: true, addedBy: demo._id },
      { groupId: group._id, displayName: "Dev", isGuest: true, addedBy: demo._id },
    ]);
    const members = [jainik, rahul, priya, dev];
    const makeExpense = async (title, amountMinor, category, paidBy, splitMethod, participantInput, daysAgo) => Expense.create({
      groupId: group._id,
      title,
      amountMinor,
      category,
      expenseDate: new Date(Date.now() - daysAgo * 86400000),
      paidBy: paidBy._id,
      participants: splitExpense(amountMinor, splitMethod, participantInput),
      splitMethod,
      splitDetails: participantInput,
      createdBy: demo._id,
      updatedBy: demo._id,
    });
    await makeExpense("Hotel", 1200000, "Travel", jainik, "equal", members.map((member) => ({ memberId: member._id })), 10);
    await makeExpense("Dinner", 360000, "Food", rahul, "exact", [
      { memberId: jainik._id, exactMinor: 90000 },
      { memberId: rahul._id, exactMinor: 90000 },
      { memberId: priya._id, exactMinor: 90000 },
      { memberId: dev._id, exactMinor: 90000 },
    ], 8);
    await makeExpense("Fuel", 240000, "Travel", dev, "percentage", [
      { memberId: jainik._id, percentage: 40 },
      { memberId: rahul._id, percentage: 20 },
      { memberId: priya._id, percentage: 20 },
      { memberId: dev._id, percentage: 20 },
    ], 6);
    await makeExpense("Office lunch", 180000, "Food", priya, "shares", [
      { memberId: jainik._id, shares: 2 },
      { memberId: rahul._id, shares: 1 },
      { memberId: priya._id, shares: 1 },
      { memberId: dev._id, shares: 2 },
    ], 2);
    await Settlement.create({ groupId: group._id, fromMember: rahul._id, toMember: jainik._id, amountMinor: 50000, method: "upi", status: "completed", createdBy: demo._id, completedAt: new Date() });
    await Settlement.create({ groupId: group._id, fromMember: priya._id, toMember: dev._id, amountMinor: 25000, method: "cash", status: "pending", createdBy: demo._id });
    await Activity.create({ groupId: group._id, actor: demo._id, action: "seed.created", entityType: "Group", entityId: group._id, message: "Seeded demo group " + group.name });
  }
  console.info("Seeded demo@splitmate.app / Demo@12345");
  await closeDatabase();
}

run().catch(async (error) => {
  console.error(error);
  await closeDatabase().catch(() => {});
  process.exit(1);
});
`);

write("server/scripts/load-test.js", `const url = process.env.LOAD_TEST_URL || "http://localhost:5000/api/health";
const total = Number(process.env.LOAD_TEST_REQUESTS || 100);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY || 20);
let completed = 0;
let ok = 0;
let failed = 0;
const start = Date.now();

async function worker() {
  while (completed < total) {
    completed++;
    try {
      const res = await fetch(url);
      if (res.ok) ok++;
      else failed++;
    } catch {
      failed++;
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
const elapsedMs = Date.now() - start;
console.log(JSON.stringify({ url, total, concurrency, ok, failed, elapsedMs, requestsPerSecond: Math.round((total / elapsedMs) * 1000) }, null, 2));
if (failed) process.exitCode = 1;
`);

write("server/tests/calculations.test.js", `import { describe, expect, it } from "vitest";
import { calculateMemberBalances, generateSettlementSuggestions, splitExpense } from "../utils/calculations.js";
import { toMinorUnits } from "../utils/currency.js";

describe("SplitMate calculation engine", () => {
  it("stores rupees as integer paise", () => {
    expect(toMinorUnits("100.50")).toBe(10050);
  });
  it("splits equally with no remainder", () => {
    expect(splitExpense(1200, "equal", [{ memberId: "a" }, { memberId: "b" }, { memberId: "c" }]).map((x) => x.shareMinor)).toEqual([400, 400, 400]);
  });
  it("splits equally with deterministic rounding", () => {
    expect(splitExpense(100, "equal", [{ memberId: "b" }, { memberId: "a" }, { memberId: "c" }]).reduce((sum, x) => sum + x.shareMinor, 0)).toBe(100);
  });
  it("validates exact totals", () => {
    expect(() => splitExpense(500, "exact", [{ memberId: "a", exactMinor: 200 }, { memberId: "b", exactMinor: 200 }])).toThrow(/Exact amounts/);
  });
  it("validates percentage totals", () => {
    expect(() => splitExpense(500, "percentage", [{ memberId: "a", percentage: 60 }, { memberId: "b", percentage: 20 }])).toThrow(/100/);
  });
  it("splits by shares", () => {
    expect(splitExpense(300, "shares", [{ memberId: "a", shares: 2 }, { memberId: "b", shares: 1 }]).map((x) => x.shareMinor)).toEqual([200, 100]);
  });
  it("keeps group balances at zero after partial settlement", () => {
    const members = [{ _id: "a" }, { _id: "b" }, { _id: "c" }];
    const expenses = [{ paidBy: "a", amountMinor: 3000, participants: [{ memberId: "a", shareMinor: 1000 }, { memberId: "b", shareMinor: 1000 }, { memberId: "c", shareMinor: 1000 }] }];
    const settlements = [{ fromMember: "b", toMember: "a", amountMinor: 500, status: "completed" }];
    const { balances } = calculateMemberBalances(members, expenses, settlements);
    expect(balances.reduce((sum, item) => sum + item.netMinor, 0)).toBe(0);
  });
  it("suggests minimum deterministic settlement transfers", () => {
    expect(generateSettlementSuggestions([{ memberId: "a", amountMinor: -700 }, { memberId: "b", amountMinor: -300 }, { memberId: "c", amountMinor: 1000 }])).toEqual([
      { fromMember: "a", toMember: "c", amountMinor: 700 },
      { fromMember: "b", toMember: "c", amountMinor: 300 },
    ]);
  });
});
`);

write("README.md", `# SplitMate

SplitMate is a JavaScript MERN expense-sharing app for groups, trips, flats, friends, couples, and office lunches. Users can create a group, add people by name, record expenses, split costs, see who owes whom, and record settlements.

## Problem Solved

Shared expenses become confusing when not everyone has an account or when bills need custom splits. SplitMate keeps the workflow simple: create a group, add people, add an expense, and settle balances in plain language.

## Features

- Register, login, logout, current user, refresh session, forgot/reset password, change password, and logout all sessions.
- Create groups with type, currency, colour, and immediate people-by-name entry.
- Guest members work without accounts.
- Add expenses with equal, exact, percentage, and shares-based splits.
- Store money as integer minor units. For INR, Rs 100.50 is stored as 10050 paise.
- Clear balances and deterministic settlement suggestions.
- Record pending or completed settlements.
- Collapsible sections for expenses, members, balances, activity, and settings.
- Light, dark, and system themes with pre-render theme application.
- Mobile bottom navigation and responsive forms.
- Health endpoint, seed script, tests, Vercel config, and Render config.

## Technology Stack

Frontend: React 18, JavaScript, JSX, Vite, React Router DOM, Axios, Chart.js, react-chartjs-2, Lucide React, custom CSS, CSS variables.

Backend: Node.js, Express.js, JavaScript, MongoDB Atlas, Mongoose, JWT auth, bcryptjs, secure HttpOnly cookies, cookie-parser, CORS, Helmet, express-rate-limit, dotenv, Nodemailer.

## Folder Structure

\`\`\`text
SplitMate/
  client/
    public/
    src/
      api/
      components/
      context/
      hooks/
      layouts/
      pages/
      routes/
      styles/
      utils/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    validators/
    scripts/
    tests/
  render.yaml
  README.md
\`\`\`

## Authentication Flow

Access tokens are short-lived and stored in HttpOnly cookies. Refresh tokens are rotated and stored as hashes in MongoDB refresh sessions. Logout revokes the current refresh session. Logout all sessions revokes every active refresh session for the user.

## Expense Splitting

All authoritative money is stored as integer minor units. The split engine supports:

- Equal split with deterministic rounding.
- Exact split where participant totals must equal the expense total.
- Percentage split where percentages must total 100%.
- Shares split where each selected participant has a positive share count.

Every group's net balance is expected to total zero.

## Security Highlights

- bcryptjs password hashing.
- HttpOnly cookies.
- Refresh-token rotation and reuse revocation.
- Helmet security headers.
- Exact CORS allowlist using CLIENT_URL.
- API rate limiting.
- Body size limit.
- Group access middleware.
- Safe production errors.
- No password hash exposure.

## Local Installation

\`\`\`bash
npm install
npm install --prefix client
npm install --prefix server
\`\`\`

Create server/.env from server/.env.example.

\`\`\`bash
npm run dev
\`\`\`

Frontend: http://localhost:5173
Backend health: http://localhost:5000/api/health

## Client Environment Variables

\`\`\`text
VITE_API_URL=http://localhost:5000/api
\`\`\`

## Server Environment Variables

\`\`\`text
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/splitmate
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-another-32-random-characters
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_DOMAIN=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=SplitMate <no-reply@example.com>
\`\`\`

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a free or suitable cluster.
3. Create a database user.
4. Use a strong username and password.
5. Open Network Access.
6. Add your current IP for local use or Render outbound access for production.
7. Copy the Atlas connection string.
8. Replace the password placeholder.
9. Add a database name such as splitmate.
10. Add the final string to server/.env as MONGO_URI.
11. Restart the backend.
12. Test /api/health.

Example placeholder:

\`\`\`text
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/splitmate?retryWrites=true&w=majority
\`\`\`

Never commit a real MongoDB username, password, or key.

## Seed Data

\`\`\`bash
npm run seed
\`\`\`

Demo credentials:

\`\`\`text
Email: demo@splitmate.app
Password: Demo@12345
\`\`\`

The seed creates Goa Trip, Flatmates, Office Lunch, Jainik, Rahul, Priya, Dev, equal/exact/percentage/shares expenses, and pending/completed settlements.

## Testing And Build

\`\`\`bash
npm run lint
npm test
npm run build
npm run load:test
\`\`\`

npm run load:test expects the API to be running and sends safe read-only requests to /api/health.

## API Overview

- GET /api/health
- /api/auth/register
- /api/auth/login
- /api/auth/refresh
- /api/auth/logout
- /api/auth/logout-all
- /api/auth/me
- /api/auth/forgot-password
- /api/auth/reset-password
- /api/auth/change-password
- /api/users/me
- /api/groups
- /api/groups/:groupId/members
- /api/groups/:groupId/expenses
- /api/groups/:groupId/balances
- /api/groups/:groupId/settlements
- /api/groups/:groupId/activity
- /api/dashboard

## Vercel Deployment

- Root directory: client
- Build command: npm run build
- Output directory: dist
- Environment variable: VITE_API_URL=https://your-render-api.onrender.com/api

client/vercel.json rewrites all routes to index.html for React Router refresh support.

## Render Deployment

- Root directory: server
- Build command: npm install
- Start command: npm start
- Health check path: /api/health
- Required env vars: MONGO_URI, CLIENT_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- Recommended production env: NODE_ENV=production

## Troubleshooting

- Login works locally but not after deploy: check CLIENT_URL, cookies, and HTTPS.
- Health says database unavailable: verify MONGO_URI and Atlas network access.
- Password reset email is not sent: configure SMTP variables. In development, email output is logged instead.
- Build fails after adding files: run npm run lint to catch syntax errors and accidental TypeScript files.

## Author

Built as a portfolio-ready MERN project for placement interviews and production-style review.
`);

console.log("Generated JavaScript MERN SplitMate project at " + root);
