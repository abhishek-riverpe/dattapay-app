import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface FundingAccountInfo {
  currency: string;
  bank_name: string;
  bank_address: string;
  bank_routing_number: string;
  bank_account_number: string;
  bank_beneficiary_name: string;
  bank_beneficiary_address: string;
  payment_rail: string;
  payment_rails: string[];
}

interface FundingAccount {
  id: string;
  entityId: string;
  jurisdictionId: string;
  providerId: string;
  status: string;
  accountInfo: FundingAccountInfo;
}

interface FundingAccountResponse {
  success: boolean;
  message: string;
  data: FundingAccount;
}

export const fundingAccountQueryKey = ["funding-account"] as const;

const useFundingAccount = () =>
  useQuery<FundingAccountResponse>({
    queryKey: fundingAccountQueryKey,
    queryFn: () =>
      apiClient
        .get<FundingAccountResponse>("/zynk/funding-account")
        .then((res) => res.data),
    retry: false,
  });

export default useFundingAccount;
export type { FundingAccount, FundingAccountInfo, FundingAccountResponse };
