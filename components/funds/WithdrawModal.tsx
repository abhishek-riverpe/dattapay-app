import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Lock,
  ClipboardPaste,
  ScanLine,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Wallet,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import ThemeButton from "@/components/ui/ThemeButton";
import QRScannerModal from "./QRScannerModal";
import {
  useExternalAccounts,
  useCreateExternalAccount,
  ExternalAccount,
} from "@/hooks/useExternalAccounts";
import {
  useSimulateTransfer,
  useExecuteTransfer,
  SimulateTransferResponse,
} from "@/hooks/useTransfer";
import useBiometricAuth from "@/hooks/useBiometricAuth";
import generateSignature from "@/lib/generate-signature";
import { getPublicKey, getPrivateKey } from "@/lib/key-generator";
import { validateSolanaAddress, sanitizeSolanaAddress } from "@/lib/address-validator";
import { sanitizeLabel, sanitizeAmount } from "@/lib/input-sanitizer";

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
}

export default function WithdrawModal({
  visible,
  onClose,
  availableBalance,
}: WithdrawModalProps) {
  const router = useRouter();
  const { authenticate } = useBiometricAuth();

  // Hooks
  const { data: externalAccountsData, isLoading: isLoadingAccounts } =
    useExternalAccounts();
  const createExternalAccount = useCreateExternalAccount();
  const simulateTransfer = useSimulateTransfer();
  const executeTransfer = useExecuteTransfer();

  // State
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState<"USDC" | "USDT">("USDC");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [label, setLabel] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [simulationData, setSimulationData] =
    useState<SimulateTransferResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<ExternalAccount | null>(null);

  // Filter withdrawal accounts only
  const withdrawalAccounts =
    externalAccountsData?.data?.filter((acc) => acc.type === "withdrawal") ||
    [];

  // Set first account as default when accounts load
  useEffect(() => {
    if (withdrawalAccounts.length > 0 && !selectedAccountId && !isAddingNew) {
      setSelectedAccountId(withdrawalAccounts[0].id);
      setSelectedAccount(withdrawalAccounts[0]);
    } else if (withdrawalAccounts.length === 0) {
      setIsAddingNew(true);
    }
  }, [withdrawalAccounts, selectedAccountId, isAddingNew]);

  const resetForm = () => {
    setStep(1);
    setSelectedCrypto("USDC");
    setSelectedAccountId(null);
    setIsAddingNew(withdrawalAccounts.length === 0);
    setLabel("");
    setDestinationAddress("");
    setWithdrawAmount("");
    setSimulationData(null);
    setSelectedAccount(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const pasteAddress = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setDestinationAddress(text);
    }
  };

  const handleQRScan = (data: string) => {
    const validationError = validateSolanaAddress(data);
    if (validationError) {
      Toast.show({
        type: "error",
        text1: "Invalid Address",
        text2: validationError,
      });
      return;
    }
    const sanitized = sanitizeSolanaAddress(data);
    if (sanitized) {
      setDestinationAddress(sanitized);
    }
  };

  const setQuickAmount = (percentage: number) => {
    const amount =
      percentage === 100
        ? availableBalance
        : (availableBalance * percentage) / 100;
    setWithdrawAmount(amount.toFixed(2));
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const handleSelectAccount = (account: ExternalAccount) => {
    setSelectedAccountId(account.id);
    setSelectedAccount(account);
    setIsAddingNew(false);
  };

  const handleAddNewToggle = () => {
    setIsAddingNew(true);
    setSelectedAccountId(null);
    setSelectedAccount(null);
  };

  // Step 1 -> Step 2: Create account if new, then proceed
  const handleStep1Continue = async () => {
    if (isAddingNew) {
      if (!destinationAddress.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a destination address",
        });
        return;
      }

      // Validate Solana address format
      const validationError = validateSolanaAddress(destinationAddress);
      if (validationError) {
        Toast.show({
          type: "error",
          text1: "Invalid Address",
          text2: validationError,
        });
        return;
      }

      const sanitizedAddress = sanitizeSolanaAddress(destinationAddress);
      if (!sanitizedAddress) {
        Toast.show({
          type: "error",
          text1: "Invalid Address",
          text2: "Please enter a valid Solana address",
        });
        return;
      }

      setIsProcessing(true);
      try {
        const result = await createExternalAccount.mutateAsync({
          walletAddress: sanitizedAddress,
          label: label.trim() || undefined,
        });

        if (result.success) {
          setSelectedAccountId(result.data.id);
          setSelectedAccount(result.data);
          setStep(2);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: result.message || "Failed to create external account",
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add account";
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!selectedAccountId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a destination account",
        });
        return;
      }
      setStep(2);
    }
  };

  // Step 2 -> Step 3: Simulate transfer
  const handleStep2Continue = async () => {
    if (!selectedAccountId) return;

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > availableBalance) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid withdrawal amount",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await simulateTransfer.mutateAsync({
        externalAccountId: selectedAccountId,
        exactAmountIn: amount,
      });

      if (result.success) {
        setSimulationData(result.data);
        setStep(3);
      } else {
        Toast.show({
          type: "error",
          text1: "Simulation Failed",
          text2: result.message || "Could not simulate transfer",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to simulate transfer";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Confirm - Biometric auth, sign, execute
  const handleConfirmWithdraw = async () => {
    if (!simulationData) return;

    setIsProcessing(true);
    try {
      // 1. Biometric authentication
      const authResult = await authenticate("Authorize withdrawal");
      if (!authResult.success) {
        Toast.show({
          type: "error",
          text1: "Authentication Failed",
          text2: authResult.error || "Please try again",
        });
        setIsProcessing(false);
        return;
      }

      // 2. Get keys from secure storage
      const publicKey = await getPublicKey();
      const privateKey = await getPrivateKey();

      if (!publicKey || !privateKey) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Security keys not found. Please re-authenticate.",
        });
        setIsProcessing(false);
        return;
      }

      // 3. Sign the payload
      const signature = await generateSignature({
        payload: simulationData.payloadToSign,
        publicKey,
        privateKey,
      });

      if (!signature) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to sign transaction",
        });
        setIsProcessing(false);
        return;
      }

      // 4. Execute transfer
      const result = await executeTransfer.mutateAsync({
        executionId: simulationData.executionId,
        signature,
      });

      if (result.success) {
        setStep(4);
      } else {
        Toast.show({
          type: "error",
          text1: "Transfer Failed",
          text2: result.message || "Could not complete transfer",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to execute transfer";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate amounts from simulation data
  const sendAmount = simulationData?.quote?.inAmount?.amount || 0;
  const receiveAmount = simulationData?.quote?.outAmount?.amount || 0;
  const totalFees = simulationData?.quote?.fees?.totalFees?.amount || 0;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-white dark:bg-[#121212]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center">
              {step > 1 && step < 4 && (
                <Pressable
                  onPress={() => setStep(step - 1)}
                  className="mr-3"
                  disabled={isProcessing}
                >
                  <ArrowLeft size={24} color="#6B7280" />
                </Pressable>
              )}
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 4 ? "Withdrawal Submitted" : "Withdraw"}
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              disabled={isProcessing}
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Step Indicator - Only show for steps 1-3 */}
          {step < 4 && (
            <View className="px-6 py-4">
              <View className="flex-row items-center justify-center">
                {[1, 2, 3].map((s, index) => (
                  <View key={s} className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        step >= s ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {step > s ? (
                        <CheckCircle size={16} color="white" />
                      ) : (
                        <Text
                          className={`text-sm font-semibold ${
                            step >= s
                              ? "text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {s}
                        </Text>
                      )}
                    </View>
                    {index < 2 && (
                      <View
                        className={`w-12 h-1 mx-1 rounded ${
                          step > s ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Text className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
                Step {step} of 3
              </Text>
            </View>
          )}

          <ScrollView className="flex-1 px-6">
            {/* Step 1: Select Destination */}
            {step === 1 && (
              <View>
                {/* Crypto Selection */}
                <Text className="text-gray-900 dark:text-white font-semibold text-base mb-3">
                  Select Crypto
                </Text>
                <View className="flex-row gap-3 mb-6">
                  <Pressable
                    onPress={() => setSelectedCrypto("USDC")}
                    className={`flex-1 p-4 rounded-xl border-2 ${
                      selectedCrypto === "USDC"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                          selectedCrypto === "USDC"
                            ? "border-primary"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedCrypto === "USDC" && (
                          <View className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </View>
                      <Text className="text-gray-900 dark:text-white font-medium">
                        USDC
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedCrypto("USDT")}
                    className={`flex-1 p-4 rounded-xl border-2 ${
                      selectedCrypto === "USDT"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                          selectedCrypto === "USDT"
                            ? "border-primary"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedCrypto === "USDT" && (
                          <View className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </View>
                      <Text className="text-gray-900 dark:text-white font-medium">
                        USDT
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Network (Locked) */}
                <Text className="text-gray-900 dark:text-white font-semibold text-base mb-3">
                  Network
                </Text>
                <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 flex-row items-center justify-between">
                  <Text className="text-gray-900 dark:text-white font-medium">
                    Solana
                  </Text>
                  <Lock size={18} color="#6B7280" />
                </View>

                {/* Destination Selection */}
                <Text className="text-gray-900 dark:text-white font-semibold text-base mb-3">
                  Destination
                </Text>

                {isLoadingAccounts ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#6366F1" />
                  </View>
                ) : (
                  <View className="mb-4">
                    {/* Existing Accounts */}
                    {withdrawalAccounts.map((account) => (
                      <Pressable
                        key={account.id}
                        onPress={() => handleSelectAccount(account)}
                        className={`p-4 rounded-xl border-2 mb-3 ${
                          selectedAccountId === account.id && !isAddingNew
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                              selectedAccountId === account.id && !isAddingNew
                                ? "border-primary"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {selectedAccountId === account.id &&
                              !isAddingNew && (
                                <View className="w-3 h-3 rounded-full bg-primary" />
                              )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 dark:text-white font-medium">
                              {account.label || "External Wallet"}
                            </Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                              {truncateAddress(account.walletAddress)}
                            </Text>
                          </View>
                          <Wallet size={20} color="#6B7280" />
                        </View>
                      </Pressable>
                    ))}

                    {/* Add New Account Option */}
                    <Pressable
                      onPress={handleAddNewToggle}
                      className={`p-4 rounded-xl border-2 border-dashed ${
                        isAddingNew
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <View className="flex-row items-center justify-center">
                        <Plus size={20} color={isAddingNew ? "#6366F1" : "#6B7280"} />
                        <Text
                          className={`ml-2 font-medium ${
                            isAddingNew
                              ? "text-primary"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          Add New Address
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                )}

                {/* New Account Form */}
                {isAddingNew && (
                  <View className="mt-4">
                    {/* Label */}
                    <Text className="text-gray-900 dark:text-white font-semibold text-base mb-3">
                      Label (Optional)
                    </Text>
                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                      <TextInput
                        value={label}
                        onChangeText={(text) => setLabel(sanitizeLabel(text))}
                        placeholder="e.g., My Binance Wallet"
                        placeholderTextColor="#9CA3AF"
                        className="text-gray-900 dark:text-white text-base"
                        maxLength={100}
                      />
                    </View>

                    {/* Destination Address */}
                    <Text className="text-gray-900 dark:text-white font-semibold text-base mb-3">
                      Destination Address
                    </Text>
                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex-row items-center mb-4">
                      <TextInput
                        value={destinationAddress}
                        onChangeText={setDestinationAddress}
                        placeholder="Enter Solana address..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-gray-900 dark:text-white text-base"
                      />
                      <Pressable onPress={pasteAddress} className="p-2">
                        <ClipboardPaste size={20} color="#6B7280" />
                      </Pressable>
                      <Pressable
                        onPress={() => setShowScanner(true)}
                        className="p-2"
                      >
                        <ScanLine size={20} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Warning */}
                <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <View className="flex-row items-start">
                    <AlertTriangle size={18} color="#F59E0B" />
                    <Text className="text-amber-700 dark:text-amber-300 text-sm ml-2 flex-1">
                      Withdrawals are irreversible. Double-check the address
                      matches the Solana network.
                    </Text>
                  </View>
                </View>

                <ThemeButton
                  variant="primary"
                  onPress={handleStep1Continue}
                  disabled={
                    isProcessing ||
                    (!isAddingNew && !selectedAccountId) ||
                    (isAddingNew && !destinationAddress.trim())
                  }
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    "Continue"
                  )}
                </ThemeButton>
              </View>
            )}

            {/* Step 2: Withdraw Amount */}
            {step === 2 && (
              <View>
                {/* Available Balance */}
                <View className="mb-6">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                    Available Balance
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-2xl font-bold">
                    ${availableBalance.toFixed(2)} {selectedCrypto}
                  </Text>
                </View>

                {/* Amount Input */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-4 items-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    Enter Amount
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 dark:text-white text-3xl font-bold">
                      $
                    </Text>
                    <TextInput
                      value={withdrawAmount}
                      onChangeText={(text) => setWithdrawAmount(sanitizeAmount(text))}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      className="text-gray-900 dark:text-white text-3xl font-bold text-center min-w-[100px]"
                      maxLength={15}
                    />
                  </View>
                </View>

                {/* Quick Amount Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <Pressable
                    onPress={() => setQuickAmount(25)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-medium">
                      25%
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setQuickAmount(50)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-medium">
                      50%
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setQuickAmount(100)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <Text className="text-center text-gray-900 dark:text-white font-medium">
                      Max
                    </Text>
                  </Pressable>
                </View>

                {/* Destination Info */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Sending to
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {selectedAccount?.label || "External Wallet"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Address
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium font-mono">
                      {truncateAddress(
                        selectedAccount?.walletAddress || destinationAddress
                      )}
                    </Text>
                  </View>
                </View>

                <ThemeButton
                  variant="primary"
                  onPress={handleStep2Continue}
                  disabled={
                    isProcessing ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > availableBalance
                  }
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    "Continue"
                  )}
                </ThemeButton>
              </View>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && simulationData && (
              <View>
                <Text className="text-gray-900 dark:text-white font-semibold text-lg mb-4">
                  Review Withdrawal
                </Text>

                {/* Summary Card */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6">
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Crypto
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {selectedCrypto}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Network
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      Solana
                    </Text>
                  </View>
                  {(selectedAccount?.label || label) && (
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Label
                      </Text>
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {selectedAccount?.label || label}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      To Address
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium font-mono">
                      {truncateAddress(
                        selectedAccount?.walletAddress || destinationAddress
                      )}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Amount
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      ${sendAmount.toFixed(2)} {simulationData.quote.inAmount.currency}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Fees
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      ${totalFees.toFixed(2)} {simulationData.quote.fees.totalFees.currency}
                    </Text>
                  </View>
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-900 dark:text-white font-semibold">
                        You'll Receive
                      </Text>
                      <Text className="text-primary font-bold text-lg">
                        ${receiveAmount.toFixed(2)} {simulationData.quote.outAmount.currency}
                      </Text>
                    </View>
                  </View>
                </View>

                <ThemeButton
                  variant="primary"
                  onPress={handleConfirmWithdraw}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    "Confirm Withdraw"
                  )}
                </ThemeButton>
              </View>
            )}

            {/* Step 4: Success Screen */}
            {step === 4 && (
              <View className="flex-1 items-center justify-center py-8">
                {/* Success Icon */}
                <View className="w-20 h-20 rounded-full bg-accent-500 items-center justify-center mb-6">
                  <CheckCircle size={40} color="white" />
                </View>

                {/* Title & Subtitle */}
                <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
                  Withdrawal Submitted
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
                  We'll notify you when it completes.
                </Text>

                {/* Amount */}
                <Text className="text-gray-900 dark:text-white text-4xl font-bold mb-2">
                  ${receiveAmount.toFixed(2)}
                </Text>

                {/* Destination */}
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  To {selectedAccount?.label || "External Wallet"} (
                  {truncateAddress(
                    selectedAccount?.walletAddress || destinationAddress
                  )}
                  )
                </Text>

                {/* Processing Badge */}
                <View className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-8">
                  <Text className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                    Processing
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="w-full gap-3">
                  <ThemeButton
                    variant="secondary"
                    onPress={() => {
                      handleClose();
                      router.push("/activity");
                    }}
                  >
                    View in Activity
                  </ThemeButton>
                  <ThemeButton variant="primary" onPress={handleClose}>
                    Done
                  </ThemeButton>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
    </>
  );
}
