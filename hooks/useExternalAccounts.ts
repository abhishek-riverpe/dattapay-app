import apiClient from "@/lib/api-client";
import { APIResponse } from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ExternalAccount = {
  id: number;
  userId: number;
  walletAddress: string;
  label: string | null;
  type: "withdrawal" | "non_custodial_wallet";
  walletId: string | null;
  zynkExternalAccountId: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
};

export type CreateExternalAccountParams = {
  walletAddress: string;
  label?: string;
};

export const externalAccountsQueryKey = ["external-accounts"] as const;

export const useExternalAccounts = () =>
  useQuery<APIResponse<ExternalAccount[]>>({
    queryKey: externalAccountsQueryKey,
    queryFn: () => apiClient.get("/external-accounts").then((res) => res.data),
  });

export const useCreateExternalAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<APIResponse<ExternalAccount>, Error, CreateExternalAccountParams>({
    mutationFn: (params) =>
      apiClient.post("/external-accounts", params).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: externalAccountsQueryKey });
    },
  });
};
