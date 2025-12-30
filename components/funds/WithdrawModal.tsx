import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { useState } from "react";
import {
  X,
  CheckCircle,
  Lock,
  ClipboardPaste,
  ScanLine,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import ThemeButton from "@/components/ui/ThemeButton";
import QRScannerModal from "./QRScannerModal";

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
}

const NETWORK_FEE = 2.0;

export default function WithdrawModal({
  visible,
  onClose,
  availableBalance,
}: WithdrawModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState<"USDC" | "USDT">("USDC");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const receiveAmount = Math.max(
    0,
    parseFloat(withdrawAmount || "0") - NETWORK_FEE
  );

  const resetForm = () => {
    setStep(1);
    setSelectedCrypto("USDC");
    setDestinationAddress("");
    setWithdrawAmount("");
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
    setDestinationAddress(data);
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
                <Pressable onPress={() => setStep(step - 1)} className="mr-3">
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
            {/* Step 1: Select Crypto & Destination */}
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
                  <Pressable onPress={() => setShowScanner(true)} className="p-2">
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
                  onPress={() => setStep(2)}
                  disabled={!destinationAddress.trim()}
                >
                  Continue
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
                      ${NETWORK_FEE.toFixed(2)}
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
                  onPress={() => setStep(3)}
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
            {step === 3 && (
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
                      ${NETWORK_FEE.toFixed(2)}
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

                <ThemeButton variant="primary" onPress={() => setStep(4)}>
                  Confirm Withdraw
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
