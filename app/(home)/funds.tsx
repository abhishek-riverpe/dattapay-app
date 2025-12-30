import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";
import useWallet from "@/hooks/useWallet";
import useCreateWallet from "@/hooks/useCreateWallet";
import { useState } from "react";
import { Copy, CheckCircle, Wallet } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import BankDetailsModal from "@/components/funds/BankDetailsModal";
import WithdrawModal from "@/components/funds/WithdrawModal";

// Dummy balance for demo
const AVAILABLE_BALANCE = 500;

export default function FundScreen() {
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();
  const createWallet = useCreateWallet();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

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
      <BankDetailsModal
        visible={showBankDetails}
        onClose={() => setShowBankDetails(false)}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        visible={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        availableBalance={AVAILABLE_BALANCE}
      />
    </SafeAreaView>
  );
}
