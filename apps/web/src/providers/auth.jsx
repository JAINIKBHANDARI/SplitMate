import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
const AuthContext = createContext({
  loading: true,
  authLoading: true,
  isAuthenticated: false,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  refreshUser: async () => undefined,
  refresh: async () => undefined,
  signOut: async () => undefined,
});
export function AuthProvider({ children }) {
  const client = useQueryClient();
  const location = useLocation();
  const shouldRestore = location.pathname.startsWith("/app");
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get("/auth/me"),
    enabled: shouldRestore,
    retry: false,
    staleTime: 5 * 60_000,
  });
  const signOut = async () => {
    await api.post("/auth/logout");
    client.setQueryData(["auth", "me"], undefined);
  };
  const refreshUser = async () => query.refetch();
  const login = async (body) => {
    const data = await api.post("/auth/login", body);
    client.setQueryData(["auth", "me"], data);
    return data;
  };
  const register = async (body) => {
    const data = await api.post("/auth/signup", body);
    client.setQueryData(["auth", "me"], data);
    return data;
  };
  const authLoading = shouldRestore && query.isLoading;
  return (
    <AuthContext.Provider
      value={{
        user: query.data?.user,
        isAuthenticated: Boolean(query.data?.user),
        loading: authLoading,
        authLoading,
        login,
        register,
        logout: signOut,
        refresh: refreshUser,
        refreshUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
