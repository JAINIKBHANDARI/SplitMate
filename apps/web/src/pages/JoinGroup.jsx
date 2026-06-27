import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import { api } from "../lib/api";
import { Button, Card, Skeleton } from "../components/ui";

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const preview = useQuery({
    queryKey: ["invite-preview", inviteCode],
    enabled: !!inviteCode,
    queryFn: () => api.get(`/groups/invitations/${inviteCode}/preview`),
    retry: false,
  });
  const join = useMutation({
    mutationFn: () => api.post(`/groups/join/${inviteCode}`),
    onSuccess: ({ group }) => {
      client.invalidateQueries({ queryKey: ["groups"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(`/app/groups/${group._id}`, { replace: true });
    },
  });
  if (!inviteCode) return <Navigate to="/app/groups" replace />;
  return (
    <div className="mx-auto grid min-h-[55vh] max-w-md place-items-center">
      <Card className="w-full p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet/10 text-violet">
          <Users />
        </div>
        {preview.isLoading ? (
          <div className="mt-5 space-y-3">
            <Skeleton className="mx-auto h-7 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
        ) : preview.isError || join.isError ? (
          <>
            <h1 className="mt-4 text-xl font-extrabold">Invite unavailable</h1>
            <p className="mt-2 text-sm text-rose-600">
              That invite is invalid, revoked, or expired.
            </p>
            <Button className="mt-5" onClick={() => navigate("/app/groups")}>
              Back to groups
            </Button>
          </>
        ) : (
          <>
            <p className="eyebrow mt-5">Group invite</p>
            <h1 className="mt-2 text-xl font-extrabold">
              {preview.data?.invite?.group?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {preview.data?.invite?.group?.description ||
                "Preview this group before joining."}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/app/groups")}>
                Reject
              </Button>
              <Button loading={join.isPending} onClick={() => join.mutate()}>
                Accept invite
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
