import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
const AuthContext = createContext({ loading: true, refresh: async () => undefined, signOut: async () => undefined });
export function AuthProvider({ children }) { const client = useQueryClient(); const query = useQuery({ queryKey: ['auth', 'me'], queryFn: () => api.get('/auth/me'), retry: false, staleTime: 5 * 60_000 }); const signOut = async () => { await api.post('/auth/logout'); client.setQueryData(['auth', 'me'], undefined); }; return <AuthContext.Provider value={{ user: query.data?.user, loading: query.isLoading, refresh: query.refetch, signOut }}>{children}</AuthContext.Provider>; }
export const useAuth = () => useContext(AuthContext);
