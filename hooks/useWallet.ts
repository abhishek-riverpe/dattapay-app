import apiClient from "@/lib/api-client";
import { APIResponse, Wallet } from "@/schemas";
import { useQuery } from "@tanstack/react-query";

export const walletQueryKey = ["wallet"] as const;

const useWallet = () =>
  useQuery<APIResponse<Wallet>>({
    queryKey: walletQueryKey,
    queryFn: () => apiClient.get("/wallet").then((res) => res.data),
    retry: false,
  });

export default useWallet;
