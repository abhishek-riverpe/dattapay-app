import apiClient from "@/lib/api-client";
import { APIResponse } from "@/schemas";
import { useMutation } from "@tanstack/react-query";

export type SimulateTransferParams = {
  externalAccountId: number;
  exactAmountIn?: number;
  exactAmountOut?: number;
  depositMemo?: string;
};

export type TransferQuote = {
  inAmount: {
    amount: number;
    currency: string;
  };
  outAmount: {
    amount: number;
    currency: string;
  };
  exchangeRate: {
    rate: number;
    conversion: string;
  };
  fees: {
    partnerFees: { amount: number; currency: string };
    zynkFees: { amount: number; currency: string };
    totalFees: { amount: number; currency: string };
  };
};

export type SimulateTransferResponse = {
  executionId: string;
  payloadToSign: string;
  quote: TransferQuote;
  validUntil: string;
};

export type ExecuteTransferParams = {
  executionId: string;
  signature: string;
};

export type ExecuteTransferResponse = {
  executionId: string;
};

export const useSimulateTransfer = () => {
  return useMutation<APIResponse<SimulateTransferResponse>, Error, SimulateTransferParams>({
    mutationFn: (params) =>
      apiClient.post("/transfer/simulate", params).then((res) => res.data),
  });
};

export const useExecuteTransfer = () => {
  return useMutation<APIResponse<ExecuteTransferResponse>, Error, ExecuteTransferParams>({
    mutationFn: (params) =>
      apiClient.post("/transfer/transfer", params).then((res) => res.data),
  });
};
