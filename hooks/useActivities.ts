import apiClient from "@/lib/api-client";
import { APIResponse } from "@/schemas";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/components/activity/types";

type ServerActivity = {
  id: string;
  type: string;
  status: string;
  amount?: number | string | null;
  metadata?: Record<string, unknown> | null;
  referenceId?: string | null;
  created_at: string;
};

type ActivitiesResponse = {
  items: ServerActivity[];
  total: number;
  limit: number;
  offset: number;
};

const ACTIVITY_QUERY_KEY = ["activities"] as const;
export const activityQueryKey = ACTIVITY_QUERY_KEY;

const withdrawTypes = new Set(["WITHDRAWAL", "TRANSFER", "PAYMENT"]);
const statusMap: Record<string, Activity["status"]> = {
  COMPLETE: "completed",
  PENDING: "processing",
  FAILED: "failed",
};

const normalizeActivity = (activity: ServerActivity): Activity => {
  const meta = (activity.metadata as Record<string, unknown> | undefined) || {};

  const amountValue = activity.amount ?? meta.amount;
  let amount = 0;
  if (typeof amountValue === "string") {
    amount = Number.parseFloat(amountValue);
  } else if (typeof amountValue === "number") {
    amount = amountValue;
  }

  const type = withdrawTypes.has(activity.type?.toUpperCase())
    ? "withdraw"
    : "deposit";

  const status =
    statusMap[activity.status?.toUpperCase()] ?? ("processing" as const);

  const txHash =
    (meta.executionId as string) ||
    (meta.txHash as string) ||
    activity.referenceId ||
    activity.id;

  return {
    id: activity.id,
    type,
    status,
    amount,
    crypto: (meta.currency as string) || "USDC",
    destination:
      (meta.destination as string) ||
      (meta.toExternalAccountId as string) ||
      undefined,
    source: (meta.source as string) || undefined,
    date: activity.created_at,
    txHash,
  };
};

export const useActivities = () =>
  useQuery<APIResponse<ActivitiesResponse>, Error, Activity[]>({
    queryKey: ACTIVITY_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<APIResponse<ActivitiesResponse>>(
        "/activity?limit=50&offset=0"
      );
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    select: (response) => response.data.items.map(normalizeActivity),
  });

