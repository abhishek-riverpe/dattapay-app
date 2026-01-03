import apiClient from "@/lib/api-client";
import generateSignature from "@/lib/generate-signature";
import { getPrivateKey, getPublicKey } from "@/lib/key-generator";
import { APIResponse, PreparePayload, Wallet, WalletAccount } from "@/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { walletQueryKey } from "./useWallet";

type CreateWalletResult = {
  wallet: Wallet;
  account: WalletAccount;
};

const createWallet = async (): Promise<CreateWalletResult> => {
  const publicKey = await getPublicKey();

  if (!publicKey) {
    throw new Error("Keys not found. Please complete account setup first.");
  }

  let privateKey: string | null;
  try {
    privateKey = await getPrivateKey();
  } catch (error) {
    if (error instanceof Error && error.message === "Biometric authentication required") {
      throw new Error("Please authenticate with biometrics to continue.");
    }
    throw error;
  }

  if (!privateKey) {
    throw new Error("Failed to retrieve private key.");
  }

  // Step 1: Prepare wallet creation
  const prepareWalletRes =
    await apiClient.post<APIResponse<PreparePayload>>("/wallet/prepare");

  if (!prepareWalletRes.data.success) {
    throw new Error(prepareWalletRes.data.message);
  }

  const { payloadId: walletPayloadId, payloadToSign: walletPayloadToSign } =
    prepareWalletRes.data.data;

  // Step 2: Sign the wallet payload
  const walletSignature = await generateSignature({
    payload: walletPayloadToSign,
    publicKey,
    privateKey,
  });

  if (!walletSignature) {
    throw new Error("Failed to generate wallet signature");
  }

  // Step 3: Submit wallet creation
  const submitWalletRes = await apiClient.post<APIResponse<Wallet>>(
    "/wallet/submit",
    {
      payloadId: walletPayloadId,
      signature: walletSignature,
    }
  );

  if (!submitWalletRes.data.success) {
    throw new Error(submitWalletRes.data.message);
  }

  const wallet = submitWalletRes.data.data;

  // Step 4: Prepare account creation
  const prepareAccountRes = await apiClient.post<APIResponse<PreparePayload>>(
    "/wallet/accounts/prepare"
  );

  if (!prepareAccountRes.data.success) {
    throw new Error(prepareAccountRes.data.message);
  }

  const { payloadId: accountPayloadId, payloadToSign: accountPayloadToSign } =
    prepareAccountRes.data.data;

  // Step 5: Sign the account payload
  const accountSignature = await generateSignature({
    payload: accountPayloadToSign,
    publicKey,
    privateKey,
  });

  if (!accountSignature) {
    throw new Error("Failed to generate account signature");
  }

  // Step 6: Submit account creation
  const submitAccountRes = await apiClient.post<APIResponse<WalletAccount>>(
    "/wallet/accounts/submit",
    {
      payloadId: accountPayloadId,
      signature: accountSignature,
    }
  );

  if (!submitAccountRes.data.success) {
    throw new Error(submitAccountRes.data.message);
  }

  const account = submitAccountRes.data.data;

  return { wallet, account };
};

const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletQueryKey });
    },
  });
};

export default useCreateWallet;
