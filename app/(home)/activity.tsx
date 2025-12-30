import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Copy,
  CheckCircle,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

// Type definition for activity
type Activity = {
  id: string;
  type: "withdraw" | "deposit";
  status: "completed" | "processing" | "failed";
  amount: number;
  crypto: string;
  destination?: string;
  source?: string;
  date: string;
  txHash: string;
};

// Dummy activity data
const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "withdraw",
    status: "completed",
    amount: 498.0,
    crypto: "USDC",
    destination: "Chase Checking ***1234",
    date: "2024-12-30T10:30:00",
    txHash: "5xK9mNp3qRs7tVw2yBc8dEf4gHj6kLm9nPq",
  },
  {
    id: "2",
    type: "deposit",
    status: "completed",
    amount: 500.0,
    crypto: "USDC",
    source: "Bank Transfer",
    date: "2024-12-29T14:20:00",
    txHash: "7yL2qRs8tVw3zAb4cDe5fGh6iJk7lMn8oPq",
  },
  {
    id: "3",
    type: "withdraw",
    status: "processing",
    amount: 150.0,
    crypto: "USDT",
    destination: "Chase Checking ***1234",
    date: "2024-12-30T09:15:00",
    txHash: "3zM5tVw2xYz6aBc7dEf8gHi9jKl0mNo1pQr",
  },
  {
    id: "4",
    type: "deposit",
    status: "failed",
    amount: 200.0,
    crypto: "USDC",
    source: "Wire Transfer",
    date: "2024-12-28T16:45:00",
    txHash: "9aB1xYz6cDe7fGh8iJk9lMn0oPq1rSt2uVw",
  },
];

export default function ActivityScreen() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  const copyTxHash = async (hash: string) => {
    await Clipboard.setStringAsync(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-accent-100 dark:bg-accent-900/30",
          text: "text-accent-700 dark:text-accent-400",
        };
      case "processing":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-700 dark:text-amber-400",
        };
      case "failed":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-400",
        };
    }
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setCopied(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your transaction history
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6">
          <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            {DUMMY_ACTIVITIES.map((activity, index) => {
              const statusColors = getStatusColor(activity.status);
              const isWithdraw = activity.type === "withdraw";

              return (
                <Pressable
                  key={activity.id}
                  onPress={() => setSelectedActivity(activity)}
                  className={`flex-row items-center p-4 ${
                    index < DUMMY_ACTIVITIES.length - 1
                      ? "border-b border-gray-100 dark:border-gray-800"
                      : ""
                  }`}
                >
                  {/* Icon */}
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      isWithdraw
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-accent-100 dark:bg-accent-900/30"
                    }`}
                  >
                    {isWithdraw ? (
                      <ArrowUpRight size={20} color="#EF4444" />
                    ) : (
                      <ArrowDownLeft size={20} color="#10B981" />
                    )}
                  </View>

                  {/* Details */}
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {isWithdraw ? "Withdrawal" : "Deposit"}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(activity.date)}
                    </Text>
                  </View>

                  {/* Amount & Status */}
                  <View className="items-end">
                    <Text
                      className={`font-semibold ${
                        isWithdraw
                          ? "text-red-600 dark:text-red-400"
                          : "text-accent-600 dark:text-accent-400"
                      }`}
                    >
                      {isWithdraw ? "-" : "+"}${activity.amount.toFixed(2)}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full mt-1 ${statusColors.bg}`}
                    >
                      <Text className={`text-xs font-medium ${statusColors.text}`}>
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Activity Details Modal */}
      <Modal
        visible={selectedActivity !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-white dark:bg-[#121212]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Transaction Details
            </Text>
            <Pressable
              onPress={closeModal}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          {selectedActivity && (
            <ScrollView className="flex-1 px-6 py-6">
              {/* Status Badge */}
              <View className="items-center mb-4">
                <View
                  className={`px-4 py-2 rounded-full ${
                    getStatusColor(selectedActivity.status).bg
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      getStatusColor(selectedActivity.status).text
                    }`}
                  >
                    {selectedActivity.status.charAt(0).toUpperCase() +
                      selectedActivity.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View className="items-center mb-6">
                <Text
                  className={`text-4xl font-bold ${
                    selectedActivity.type === "withdraw"
                      ? "text-red-600 dark:text-red-400"
                      : "text-accent-600 dark:text-accent-400"
                  }`}
                >
                  {selectedActivity.type === "withdraw" ? "-" : "+"}$
                  {selectedActivity.amount.toFixed(2)}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {selectedActivity.crypto}
                </Text>
              </View>

              {/* Details Card */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                {/* Type */}
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Type
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {selectedActivity.type === "withdraw"
                      ? "Withdrawal"
                      : "Deposit"}
                  </Text>
                </View>

                {/* Network */}
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Network
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    Solana
                  </Text>
                </View>

                {/* To/From */}
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedActivity.type === "withdraw" ? "To" : "From"}
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {selectedActivity.destination || selectedActivity.source}
                  </Text>
                </View>

                {/* Date */}
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Date
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {formatDate(selectedActivity.date)}
                  </Text>
                </View>

                {/* Time */}
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Time
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {formatTime(selectedActivity.date)}
                  </Text>
                </View>

                {/* Transaction ID */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Transaction ID
                  </Text>
                  <Pressable
                    onPress={() => copyTxHash(selectedActivity.txHash)}
                    className="flex-row items-center"
                  >
                    <Text className="text-gray-900 dark:text-white font-medium font-mono mr-2">
                      {truncateHash(selectedActivity.txHash)}
                    </Text>
                    {copied ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : (
                      <Copy size={16} color="#6B7280" />
                    )}
                  </Pressable>
                </View>

                {/* Network Fee (only for withdrawals) */}
                {selectedActivity.type === "withdraw" && (
                  <View className="flex-row justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Network Fee
                    </Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      $2.00
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
