import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CircleUserRound,
  CreditCard,
  Home,
  LogOut,
  Moon,
  Plus,
  Sun,
  Users,
} from "lucide-react";
import { Avatar, Button } from "../components/ui";
import { useAuth } from "../providers/auth";
import { useTheme } from "../providers/theme";
const links = [
  { to: "/app", label: "Overview", icon: Home, end: true },
  { to: "/app/groups", label: "Groups", icon: Users },
  { to: "/app/settlements", label: "Settle up", icon: CreditCard },
  { to: "/app/profile", label: "Profile", icon: CircleUserRound },
];
const titles = {
  "/app": "Overview",
  "/app/groups": "Groups",
  "/app/settlements": "Settlements",
  "/app/profile": "Profile",
};
export function AppShell() {
  const { user, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const heading = location.pathname.includes("/groups/")
    ? "Group workspace"
    : (titles[location.pathname] ?? "SplitMate");
  const logOut = () => void signOut().then(() => navigate("/login"));
  return (
    <div className="app-canvas min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-paper/90 p-4 backdrop-blur md:flex md:flex-col">
        <NavLink
          to="/app"
          className="mb-8 flex items-center gap-2.5 px-2 text-xl font-extrabold tracking-[-.04em]"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-violet text-sm text-white shadow-lg shadow-violet/25">
            S
          </span>
          <span>SplitMate</span>
        </NavLink>
        <p className="eyebrow mb-2 px-3">Workspace</p>
        <nav aria-label="Primary navigation" className="space-y-1">
          {links.map(({ icon: Icon, ...link }) => (
            <NavLink key={link.to} {...link} className="nav-link">
              <Icon className="size-[18px]" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-link w-full"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
            {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button type="button" onClick={logOut} className="nav-link w-full">
            <LogOut className="size-[18px]" />
            Sign out
          </button>
          <NavLink
            to="/app/profile"
            className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-violet/5 p-3 transition hover:bg-violet/10"
          >
            <Avatar user={user} />
            <span className="min-w-0 text-left">
              <b className="block truncate text-sm">{user?.name}</b>
              <span className="block truncate text-xs text-slate-500">
                {user?.email}
              </span>
            </span>
          </NavLink>
        </div>
      </aside>
      <main className="pb-28 md:ml-64 md:pb-10">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-paper/82 px-4 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-base font-bold tracking-tight sm:text-lg">
              {heading}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-violet/10 hover:text-violet"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
            </button>
            <Button onClick={() => navigate("/app/groups")} className="px-3">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New group</span>
            </Button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-around border-t border-line bg-paper/95 px-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
      >
        <NavLink
          to="/app"
          end
          className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold text-slate-500 [&.active]:text-violet"
        >
          <Home className="size-5" />
          Home
        </NavLink>
        <NavLink
          to="/app/groups"
          className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold text-slate-500 [&.active]:text-violet"
        >
          <Users className="size-5" />
          Groups
        </NavLink>
        <button
          type="button"
          onClick={() => navigate("/app/groups")}
          className="-mt-6 grid size-12 place-items-center rounded-2xl bg-violet text-white shadow-lg shadow-violet/30"
          aria-label="Create a new group"
        >
          <Plus className="size-5" />
        </button>
        <NavLink
          to="/app/settlements"
          className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold text-slate-500 [&.active]:text-violet"
        >
          <CreditCard className="size-5" />
          Settle
        </NavLink>
        <NavLink
          to="/app/profile"
          className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold text-slate-500 [&.active]:text-violet"
        >
          <CircleUserRound className="size-5" />
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
