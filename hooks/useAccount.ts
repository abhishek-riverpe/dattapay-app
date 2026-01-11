import apiClient from "@/lib/api-client";
import { APIResponse } from "@/schemas";
import { Account } from "@/schemas/account";
import { useQuery } from "@tanstack/react-query";

const useAccount = () =>
  useQuery<APIResponse<Account>>({
    queryKey: ["account"],
    queryFn: () =>
      apiClient.get<APIResponse<Account>>("/account").then((res) => res.data),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

export default useAccount;
