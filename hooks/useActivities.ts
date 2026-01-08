import apiClient from "@/lib/api-client";
import { APIResponse } from "@/schemas";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/components/activity/types";

type ServerActivity = {
  id: string;
  type: string;
  status: string;
  description?: string | null;
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
const financialTypes = new Set([
  "TRANSFER",
  "WITHDRAWAL",
  "DEPOSIT",
  "PAYMENT",
]);
const typeLabelMap: Record<string, string> = {
  TRANSFER: "Transfer",
  WITHDRAWAL: "Withdrawal",
  DEPOSIT: "Deposit",
  PAYMENT: "Payment",
  KYC_SUBMITTED: "KYC Submitted",
  KYC_PENDING: "KYC Pending",
  KYC_APPROVED: "KYC Approved",
  KYC_REJECTED: "KYC Rejected",
  KYC_FAILED: "KYC Failed",
  ACCOUNT_APPROVED: "Account Approved",
  ACCOUNT_ACTIVATED: "Account Activated",
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const humanizeType = (rawType: string) => {
  if (!rawType) return "Activity";
  const upper = rawType.toUpperCase();
  if (typeLabelMap[upper]) return typeLabelMap[upper];
  return upper
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

const normalizeActivity = (activity: ServerActivity): Activity => {
  const meta = (activity.metadata as Record<string, unknown> | undefined) || {};
  const quote = (meta.quote as Record<string, any> | undefined) || {};

  const amount =
    toNumber(activity.amount) ??
    toNumber(meta.amount) ??
    toNumber(quote.outAmount?.amount) ??
    toNumber(quote.inAmount?.amount);

  const rawType = activity.type?.toUpperCase();
  const type = withdrawTypes.has(rawType) ? "withdraw" : "deposit";

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
    title: humanizeType(rawType),
    rawType: rawType || undefined,
    isFinancial: financialTypes.has(rawType || ""),
    amount: amount ?? null,
    crypto:
      (meta.currency as string) ||
      (quote.outAmount?.currency as string) ||
      (quote.inAmount?.currency as string) ||
      "USDC",
    destination:
      (meta.destination as string) ||
      (meta.walletAddress as string) ||
      (meta.toExternalAccountId as string) ||
      (meta.externalAccountId as string) ||
      undefined,
    source: (meta.source as string) || (meta.from as string) || undefined,
    date: activity.created_at,
    txHash,
    description:
      activity.description ||
      (meta.message as string) ||
      (meta.error as string) ||
      null,
    network:
      (meta.network as string) ||
      (meta.chain as string) ||
      (quote.exchangeRate?.conversion as string) ||
      null,
    fee:
      toNumber(meta.fee) ??
      toNumber(meta.networkFee) ??
      toNumber(quote.fees?.totalFees?.amount) ??
      toNumber(quote.fees?.partnerFees?.amount) ??
      toNumber(quote.fees?.zynkFees?.amount) ??
      null,
    referenceId: activity.referenceId || (meta.referenceId as string) || null,
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

