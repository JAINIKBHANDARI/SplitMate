import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card } from '../components/ui';
export default function JoinGroup() { const { inviteCode } = useParams(); const navigate = useNavigate(); const client = useQueryClient(); const join = useMutation({ mutationFn: () => api.post(`/groups/join/${inviteCode}`), onSuccess: ({ group }) => { client.invalidateQueries({ queryKey: ['groups'] }); client.invalidateQueries({ queryKey: ['dashboard'] }); navigate(`/app/groups/${group._id}`, { replace: true }); } }); useEffect(() => { if (inviteCode && !join.isPending && !join.isSuccess && !join.isError)
    join.mutate(); }, [inviteCode]); if (!inviteCode)
    return <Navigate to="/app/groups" replace/>; return <div className="mx-auto grid min-h-[55vh] max-w-md place-items-center"><Card className="w-full p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet/10 text-violet"><Users /></div><h1 className="mt-4 text-xl font-extrabold">Joining your group</h1>{join.isError ? <><p className="mt-2 text-sm text-rose-600">That invite is unavailable or has expired.</p><Button className="mt-5" onClick={() => navigate('/app/groups')}>Back to groups</Button></> : <p className="mt-2 text-sm text-slate-500">One moment. We’re adding you in.</p>}</Card></div>; }
