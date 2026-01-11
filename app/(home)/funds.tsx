import BankDetailsModal from "@/components/funds/BankDetailsModal";
import WithdrawModal from "@/components/funds/WithdrawModal";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";
import useCreateWallet from "@/hooks/useCreateWallet";
import useWallet from "@/hooks/useWallet";
import useWalletBalances from "@/hooks/useWalletBalances";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";

// Token icon mapping
const TOKEN_ICONS: Record<string, ReturnType<typeof require>> = {
  USDT: require("@/assets/images/usdt.png"),
  USDC: require("@/assets/images/usdc.png"),
};

export default function FundScreen() {
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();
  const { data: balancesData, isLoading: isLoadingBalances } = useWalletBalances();
  const createWallet = useCreateWallet();
  const [error, setError] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const wallet = walletData?.data;
  const hasWallet = wallet && walletData?.success;

  // Extract token balances from API response
  const tokenBalances = useMemo(() => {
    if (!balancesData?.data?.accounts?.[0]?.balances) return [];
    return balancesData.data.accounts[0].balances;
  }, [balancesData]);

  // Calculate total balance from all tokens
  const totalBalance = useMemo(() => {
    return tokenBalances.reduce((sum, token) => {
      const balance = parseFloat(token.balance) / Math.pow(10, token.tokenDecimals);
      return sum + balance;
    }, 0);
  }, [tokenBalances]);

  const handleCreateWallet = async () => {
    setError(null);
    try {
      await createWallet.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    }
  };

  if (isLoadingWallet || isLoadingBalances) {
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
              <Text className="text-white text-4xl font-bold">
                ${totalBalance.toFixed(2)}
              </Text>
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
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-primary-100 text-xs uppercase tracking-wide">
                        Wallet
                      </Text>
                      <Text className="text-white text-lg font-semibold">
                        {wallet.walletName}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-white/20 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {wallet.chain}
                        </Text>
                      </View>
                      <View className="bg-accent-500 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {wallet.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Wallet Address */}
                  {wallet.account?.address && (
                    <TouchableOpacity
                      className="mt-4 bg-white/10 rounded-xl p-3"
                      onPress={() =>
                        Clipboard.setStringAsync(wallet.account!.address)
                      }
                      activeOpacity={0.7}
                    >
                      <Text className="text-primary-100 text-xs mb-1">
                        Wallet Address (tap to copy)
                      </Text>
                      <Text
                        className="text-white text-sm font-mono"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {wallet.account.address}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Crypto Balances */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-5">
                  <Text className="text-gray-900 dark:text-white font-semibold text-base mb-4">
                    Crypto Balances
                  </Text>

                  <View className="gap-3">
                    {tokenBalances.length === 0 ? (
                      <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No token balances found
                      </Text>
                    ) : (
                      tokenBalances.map((token) => {
                        const balance = parseFloat(token.balance) / Math.pow(10, token.tokenDecimals);
                        const icon = TOKEN_ICONS[token.tokenSymbol];
                        return (
                          <View
                            key={token.tokenAddress}
                            className="flex-row items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-xl"
                          >
                            <View className="flex-row items-center">
                              {icon && (
                                <Image
                                  source={icon}
                                  className="w-8 h-8 mr-3"
                                />
                              )}
                              <Text className="text-gray-900 dark:text-white font-medium text-base">
                                {token.tokenSymbol}
                              </Text>
                            </View>
                            <Text className="text-gray-900 dark:text-white font-semibold text-lg">
                              ${balance.toFixed(2)}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>

                {/* Withdraw Button */}
                <ThemeButton
                  variant="primary"
                  onPress={() => setShowWithdraw(true)}
                >
                  Withdraw
                </ThemeButton>
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
        availableBalance={totalBalance}
      />
    </SafeAreaView>
  );
}
