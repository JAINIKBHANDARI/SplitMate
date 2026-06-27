import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ThemeProvider } from "./providers/theme";
import { AuthProvider } from "./providers/auth";
import { Protected } from "./components/Protected";
import { AppShell } from "./layouts/AppShell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const JoinGroup = lazy(() => import("./pages/JoinGroup"));
const Settlements = lazy(() => import("./pages/Settlements"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Legal = lazy(() => import("./pages/Legal"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});
const Loading = () => (
  <div className="p-8 text-sm text-slate-500">Loading…</div>
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth mode="login" />} />
                <Route path="/signup" element={<Auth mode="signup" />} />
                <Route
                  path="/forgot-password"
                  element={<Auth mode="forgot" />}
                />
                <Route path="/reset-password" element={<Auth mode="reset" />} />
                <Route path="/privacy" element={<Legal />} />
                <Route path="/terms" element={<Legal />} />
                <Route element={<Protected />}>
                  <Route element={<AppShell />}>
                    <Route path="/app" element={<Dashboard />} />
                    <Route path="/app/groups" element={<Groups />} />
                    <Route
                      path="/app/groups/join/:inviteCode"
                      element={<JoinGroup />}
                    />
                    <Route
                      path="/app/groups/:groupId/*"
                      element={<GroupDetail />}
                    />
                    <Route path="/app/settlements" element={<Settlements />} />
                    <Route path="/app/profile" element={<Profile />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
