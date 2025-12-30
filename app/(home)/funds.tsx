import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";
import useWallet from "@/hooks/useWallet";
import useCreateWallet from "@/hooks/useCreateWallet";
import { useState } from "react";
import {
  Copy,
  CheckCircle,
  Wallet,
  X,
  Info,
  Share2,
  Lock,
  ClipboardPaste,
  ScanLine,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

// Dummy bank details for receiving funds
const BANK_DETAILS = {
  accountHolderName: "DattaPay Inc.",
  bankName: "Lead Bank",
  routingNumber: "084106768",
  accountNumber: "9800012345",
  reference: "USER-12345",
};

export default function FundScreen() {
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();
  const createWallet = useCreateWallet();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState<"USDC" | "USDT">("USDC");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Dummy balance for demo
  const availableBalance = 500;

  const wallet = walletData?.data;
  const hasWallet = wallet && walletData?.success;

  const handleCreateWallet = async () => {
    setError(null);
    try {
      await createWallet.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    }
  };

  const copyAddress = async () => {
    if (wallet?.account?.address) {
      await Clipboard.setStringAsync(wallet.account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyField = async (field: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAllDetails = () => {
    return `Account Holder Name: ${BANK_DETAILS.accountHolderName}
Bank Name: ${BANK_DETAILS.bankName}
Routing Number: ${BANK_DETAILS.routingNumber}
Account Number: ${BANK_DETAILS.accountNumber}
Reference/Memo (Required): ${BANK_DETAILS.reference}`;
  };

  const copyAllDetails = async () => {
    await Clipboard.setStringAsync(formatAllDetails());
    setCopiedField("all");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const shareDetails = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      // Create a temporary file to share
      const details = formatAllDetails();
      await Clipboard.setStringAsync(details);
      setCopiedField("shared");
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Withdraw helper functions
  const pasteAddress = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setDestinationAddress(text);
    }
  };

  const handleQRScan = (data: string) => {
    setDestinationAddress(data);
    setShowScanner(false);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (result.granted) {
        setShowScanner(true);
      }
    } else {
      setShowScanner(true);
    }
  };

  const setQuickAmount = (percentage: number) => {
    const amount =
      percentage === 100
        ? availableBalance
        : (availableBalance * percentage) / 100;
    setWithdrawAmount(amount.toFixed(2));
  };

  const resetWithdraw = () => {
    setWithdrawStep(1);
    setSelectedCrypto("USDC");
    setDestinationAddress("");
    setWithdrawAmount("");
  };

  const closeWithdraw = () => {
    setShowWithdraw(false);
    resetWithdraw();
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const networkFee = 2.0;
  const receiveAmount = Math.max(
    0,
    parseFloat(withdrawAmount || "0") - networkFee
  );

  if (isLoadingWallet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] items-center justify-center">
        <ActivityIndicator size="large" color="#005AEE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-primary px-6 pt-4 pb-8 rounded-b-3xl">
          <View className="flex-row items-center mb-2">
            <View className="bg-white/20 p-2 rounded-xl mr-3">
              <Wallet size={24} color="white" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">Funds</Text>
              <Text className="text-primary-100 text-sm">
                Your unified balance overview
              </Text>
            </View>
          </View>

          {/* Balance Card */}
          <View className="bg-white/10 rounded-2xl p-5 mt-4">
            <Text className="text-primary-100 text-sm mb-1">Total Balance</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-4xl font-bold">$0.00</Text>
              <ThemeButton
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => setShowBankDetails(true)}
              >
                Get Paid
              </ThemeButton>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 -mt-4">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm flex-1">
            {hasWallet ? (
              <View className="flex-1">
                {/* Wallet Card */}
                <View className="bg-primary rounded-2xl p-5 mb-5">
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <Text className="text-primary-100 text-xs uppercase tracking-wide">
                        Wallet
                      </Text>
                      <Text className="text-white text-lg font-semibold">
                        {wallet.walletName}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <ThemeButton
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        onPress={() => setShowWithdraw(true)}
                      >
                        Withdraw
                      </ThemeButton>
                      <View className="bg-accent-500 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {wallet.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="border-t border-white/20 pt-4">
                    <Text className="text-primary-100 text-xs uppercase tracking-wide mb-1">
                      Network
                    </Text>
                    <Text className="text-white text-base font-medium">
                      {wallet.chain}
                    </Text>
                  </View>
                </View>

                {/* Account Info */}
                {wallet.account && (
                  <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                    <Text className="text-gray-900 dark:text-white font-semibold text-base mb-4">
                      Account Details
                    </Text>

                    <View className="mb-4">
                      <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-2">
                        Address
                      </Text>
                      <Pressable
                        onPress={copyAddress}
                        className="flex-row items-center bg-white dark:bg-gray-700 p-3 rounded-xl"
                      >
                        <Text
                          className="text-gray-900 dark:text-white text-sm flex-1 font-mono"
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {wallet.account.address}
                        </Text>
                        {copied ? (
                          <CheckCircle size={18} color="#10B981" />
                        ) : (
                          <Copy size={18} color="#6B7280" />
                        )}
                      </Pressable>
                    </View>

                    <View className="flex-row">
                      <View className="flex-1 mr-3 bg-white dark:bg-gray-700 p-3 rounded-xl">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                          Curve
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-sm font-medium">
                          {wallet.account.curve.replace("CURVE_", "")}
                        </Text>
                      </View>
                      <View className="flex-1 bg-white dark:bg-gray-700 p-3 rounded-xl">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                          Path
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-sm font-medium">
                          {wallet.account.path}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <EmptyState
                  icon="💳"
                  iconSize="xl"
                  title="No wallet created"
                  description="Create a wallet to start managing your crypto assets."
                  action={
                    <ThemeButton
                      variant="primary"
                      fullWidth={false}
                      onPress={handleCreateWallet}
                      disabled={createWallet.isPending}
                    >
                      {createWallet.isPending
                        ? "Creating Wallet..."
                        : "Create Wallet"}
                    </ThemeButton>
                  }
                />
                {error && (
                  <View className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl w-full">
                    <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                      {error}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bank Details Modal */}
      <Modal
        visible={showBankDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBankDetails(false)}
      >
        <View className="flex-1 bg-white dark:bg-[#121212]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Bank Account Details
            </Text>
            <Pressable
              onPress={() => setShowBankDetails(false)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-5">
            {/* Detail Fields */}
            <View className="gap-4">
              {/* Account Holder Name */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Account Holder Name
                  </Text>
                  <Pressable
                    onPress={() =>
                      copyField("accountHolder", BANK_DETAILS.accountHolderName)
                    }
                  >
                    {copiedField === "accountHolder" ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-gray-900 dark:text-white text-base font-medium">
                  {BANK_DETAILS.accountHolderName}
                </Text>
              </View>

              {/* Bank Name */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Bank Name
                  </Text>
                  <Pressable
                    onPress={() => copyField("bankName", BANK_DETAILS.bankName)}
                  >
                    {copiedField === "bankName" ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-gray-900 dark:text-white text-base font-medium">
                  {BANK_DETAILS.bankName}
                </Text>
              </View>

              {/* Routing Number */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Routing Number
                  </Text>
                  <Pressable
                    onPress={() =>
                      copyField("routingNumber", BANK_DETAILS.routingNumber)
                    }
                  >
                    {copiedField === "routingNumber" ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                  {BANK_DETAILS.routingNumber}
                </Text>
              </View>

              {/* Account Number */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Account Number
                  </Text>
                  <Pressable
                    onPress={() =>
                      copyField("accountNumber", BANK_DETAILS.accountNumber)
                    }
                  >
                    {copiedField === "accountNumber" ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                  {BANK_DETAILS.accountNumber}
                </Text>
              </View>

              {/* Reference/Memo with Required Badge */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                      Reference/Memo
                    </Text>
                    <View className="bg-red-500 px-2 py-0.5 rounded ml-2">
                      <Text className="text-white text-xs font-medium">
                        Required
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() =>
                      copyField("reference", BANK_DETAILS.reference)
                    }
                  >
                    {copiedField === "reference" ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                  {BANK_DETAILS.reference}
                </Text>
              </View>
            </View>

            {/* Info Note */}
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-5">
              <View className="flex-row items-start">
                <Info size={18} color="#3B82F6" className="mt-0.5" />
                <Text className="text-blue-700 dark:text-blue-300 text-sm ml-2 flex-1">
                  Funds arrive in USD and auto-convert to USDC.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="mt-6 gap-3">
              <ThemeButton
                variant="primary"
                onPress={copyAllDetails}
                leftIcon={
                  copiedField === "all" ? (
                    <CheckCircle size={18} color="white" />
                  ) : (
                    <Copy size={18} color="white" />
                  )
                }
              >
                {copiedField === "all" ? "Copied!" : "Copy All Details"}
              </ThemeButton>

              <ThemeButton
                variant="secondary"
                onPress={shareDetails}
                leftIcon={<Share2 size={18} color="#374151" />}
              >
                {copiedField === "shared" ? "Copied to Share!" : "Share"}
              </ThemeButton>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdraw}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeWithdraw}
      >
        <View className="flex-1 bg-white dark:bg-[#121212]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center">
              {withdrawStep > 1 && withdrawStep < 4 && (
                <Pressable
                  onPress={() => setWithdrawStep(withdrawStep - 1)}
                  className="mr-3"
                >
                  <ArrowLeft size={24} color="#6B7280" />
                </Pressable>
              )}
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {withdrawStep === 4 ? "Withdrawal Submitted" : "Withdraw"}
              </Text>
            </View>
            <Pressable
              onPress={closeWithdraw}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Step Indicator - Only show for steps 1-3 */}
          {withdrawStep < 4 && (
            <View className="px-6 py-4">
              <View className="flex-row items-center justify-center">
                {[1, 2, 3].map((step, index) => (
                  <View key={step} className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        withdrawStep >= step
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {withdrawStep > step ? (
                        <CheckCircle size={16} color="white" />
                      ) : (
                        <Text
                          className={`text-sm font-semibold ${
                            withdrawStep >= step
                              ? "text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step}
                        </Text>
                      )}
                    </View>
                    {index < 2 && (
                      <View
                        className={`w-12 h-1 mx-1 rounded ${
                          withdrawStep > step
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Text className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
                Step {withdrawStep} of 3
              </Text>
            </View>
          )}

          <ScrollView className="flex-1 px-6">
            {/* Step 1: Select Crypto & Destination */}
            {withdrawStep === 1 && (
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
                  <Pressable onPress={openScanner} className="p-2">
                    <ScanLine size={20} color="#6B7280" />
                  </Pressable>
                </View>

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
                  onPress={() => setWithdrawStep(2)}
                  disabled={!destinationAddress.trim()}
                >
                  Continue
                </ThemeButton>
              </View>
            )}

            {/* Step 2: Withdraw Amount */}
            {withdrawStep === 2 && (
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
                      onChangeText={setWithdrawAmount}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      className="text-gray-900 dark:text-white text-3xl font-bold text-center min-w-[100px]"
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

                {/* Fee Info */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Network Fee
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      ${networkFee.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Estimated Arrival
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      Instant
                    </Text>
                  </View>
                </View>

                <ThemeButton
                  variant="primary"
                  onPress={() => setWithdrawStep(3)}
                  disabled={
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > availableBalance
                  }
                >
                  Continue
                </ThemeButton>
              </View>
            )}

            {/* Step 3: Confirmation */}
            {withdrawStep === 3 && (
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
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      To Address
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium font-mono">
                      {truncateAddress(destinationAddress)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Amount
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      ${parseFloat(withdrawAmount || "0").toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Network Fee
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      ${networkFee.toFixed(2)}
                    </Text>
                  </View>
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-900 dark:text-white font-semibold">
                        You'll Receive
                      </Text>
                      <Text className="text-primary font-bold text-lg">
                        ${receiveAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                <ThemeButton variant="primary" onPress={() => setWithdrawStep(4)}>
                  Confirm Withdraw
                </ThemeButton>
              </View>
            )}

            {/* Step 4: Success Screen */}
            {withdrawStep === 4 && (
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
                  To Chase Checking ***1234
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
                      closeWithdraw();
                      router.push("/activity");
                    }}
                  >
                    View in Activity
                  </ThemeButton>
                  <ThemeButton variant="primary" onPress={closeWithdraw}>
                    Done
                  </ThemeButton>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            {/* Scanner Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
              <Text className="text-white text-xl font-bold">Scan QR Code</Text>
              <Pressable
                onPress={() => setShowScanner(false)}
                className="p-2 rounded-full bg-white/20"
              >
                <X size={24} color="white" />
              </Pressable>
            </View>

            {/* Camera View */}
            <View className="flex-1 items-center justify-center">
              {permission?.granted ? (
                <CameraView
                  style={{ width: "100%", height: "100%" }}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={(result) => {
                    if (result.data) {
                      handleQRScan(result.data);
                    }
                  }}
                >
                  {/* Scan Frame Overlay */}
                  <View className="flex-1 items-center justify-center">
                    <View className="w-64 h-64 border-2 border-white rounded-2xl" />
                    <Text className="text-white text-center mt-4">
                      Point camera at QR code
                    </Text>
                  </View>
                </CameraView>
              ) : (
                <View className="items-center px-6">
                  <Text className="text-white text-center mb-4">
                    Camera permission is required to scan QR codes
                  </Text>
                  <ThemeButton
                    variant="secondary"
                    fullWidth={false}
                    onPress={requestPermission}
                  >
                    Grant Permission
                  </ThemeButton>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
