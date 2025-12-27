import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";
import useWallet from "@/hooks/useWallet";
import useCreateWallet from "@/hooks/useCreateWallet";
import { useState } from "react";

export default function WalletScreen() {
  const { data: walletData, isLoading: isLoadingWallet } = useWallet();
  const createWallet = useCreateWallet();
  const [error, setError] = useState<string | null>(null);

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

  if (isLoadingWallet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Wallet
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your cards and accounts
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex-1">
            {hasWallet ? (
              <View className="flex-1">
                {/* Wallet Card */}
                <View className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 mb-6 bg-indigo-600">
                  <Text className="text-white text-sm opacity-80 mb-1">
                    {wallet.walletName}
                  </Text>
                  <Text className="text-white text-lg font-semibold mb-4">
                    {wallet.chain}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white text-xs opacity-70">
                        Status
                      </Text>
                      <Text className="text-white text-sm font-medium">
                        {wallet.status}
                      </Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs">Active</Text>
                    </View>
                  </View>
                </View>

                {/* Account Info */}
                {wallet.account && (
                  <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <Text className="text-gray-900 dark:text-white font-semibold mb-3">
                      Account Details
                    </Text>

                    <View className="mb-3">
                      <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                        Address
                      </Text>
                      <Text
                        className="text-gray-900 dark:text-white text-sm"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {wallet.account.address}
                      </Text>
                    </View>

                    <View className="flex-row">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          Curve
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-sm">
                          {wallet.account.curve.replace("CURVE_", "")}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          Path
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-sm">
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
                  <View className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg w-full">
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
    </SafeAreaView>
  );
}
