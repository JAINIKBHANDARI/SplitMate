import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/auth';
import { Skeleton } from './ui';
export function Protected() { const { user, loading } = useAuth(); const location = useLocation(); if (loading)
    return <div className="mx-auto max-w-5xl p-8"><Skeleton className="h-12 w-52"/><Skeleton className="mt-8 h-64"/></div>; return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }}/>; }
