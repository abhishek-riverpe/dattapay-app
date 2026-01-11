import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface TokenBalance {
  token: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  isTestnet: boolean;
  balance: string;
}

interface WalletBalancesAccount {
  curve: string;
  pathFormat: string;
  path: string;
  addressFormat: string;
  address: string;
  balances: TokenBalance[];
}

interface WalletBalancesData {
  id: string;
  entityId: string;
  walletId: string;
  accounts: WalletBalancesAccount[];
  createdAt: string;
  updatedAt: string;
}

interface WalletBalancesResponse {
  success: boolean;
  message: string;
  data: WalletBalancesData;
}

export const walletBalancesQueryKey = ["wallet-balances"] as const;

const useWalletBalances = () =>
  useQuery<WalletBalancesResponse>({
    queryKey: walletBalancesQueryKey,
    queryFn: () =>
      apiClient
        .get<WalletBalancesResponse>("/wallet/balances")
        .then((res) => res.data),
    retry: false,
  });

export default useWalletBalances;
export type { TokenBalance, WalletBalancesAccount, WalletBalancesData, WalletBalancesResponse };
