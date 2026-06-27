import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { api } from "../lib/api";
import { dateLabel, money } from "../lib/format";
import { Button, Card, Empty, Skeleton } from "../components/ui";
import { useAuth } from "../providers/auth";
export default function Settlements() {
  const { user } = useAuth();
  const client = useQueryClient();
  const groups = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.get("/groups"),
  });
  const update = useMutation({
    mutationFn: ({ groupId, settlementId, status }) =>
      api.patch(`/groups/${groupId}/settlements/${settlementId}`, { status }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["settlements"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const settlements = useQuery({
    queryKey: ["settlements"],
    enabled: !!groups.data,
    queryFn: async () => {
      const rows = await Promise.all(
        (groups.data?.groups ?? []).map(async (group) => ({
          group,
          settlements: (await api.get(`/groups/${group._id}/settlements`))
            .settlements,
        })),
      );
      return rows.flatMap((row) =>
        row.settlements.map((settlement) => ({
          ...settlement,
          group: row.group,
        })),
      );
    },
  });
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">Payment history</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Settlements.
        </h1>
      </section>
      {groups.isLoading || settlements.isLoading ? (
        <Skeleton className="h-64" />
      ) : !settlements.data?.length ? (
        <Empty icon={<CreditCard />} title="No settlements yet" />
      ) : (
        <Card className="overflow-hidden">
          {settlements.data.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 border-b px-5 py-4 last:border-0"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-mint/10 text-mint">
                <CreditCard className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">
                  {item.fromUserId?.name} paid {item.toUserId?.name}
                </b>
                <small className="text-xs text-slate-500">
                  {item.group.name} · {dateLabel(item.settledAt)}
                </small>
              </span>
              <span className="text-right">
                <b className="block text-sm">
                  {money(item.amountMinor, item.currency)}
                </b>
                <small
                  className={`text-xs ${item.status === "cancelled" ? "text-rose-500" : "text-mint"}`}
                >
                  {item.status}
                </small>
              </span>
              <div className="flex shrink-0 gap-2">
                {String(item.toUserId?._id) === user?.id &&
                  ["pending", "sent"].includes(item.status) && (
                    <Button
                      variant="secondary"
                      loading={update.isPending}
                      onClick={() =>
                        update.mutate({
                          groupId: item.group._id,
                          settlementId: item._id,
                          status: "confirmed",
                        })
                      }
                    >
                      Confirm
                    </Button>
                  )}
                {String(item.fromUserId?._id) === user?.id &&
                  ["pending", "sent"].includes(item.status) && (
                    <Button
                      variant="ghost"
                      loading={update.isPending}
                      onClick={() =>
                        update.mutate({
                          groupId: item.group._id,
                          settlementId: item._id,
                          status: "cancelled",
                        })
                      }
                    >
                      Cancel
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
