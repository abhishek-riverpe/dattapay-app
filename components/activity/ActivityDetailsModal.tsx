import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { X, Copy, CheckCircle } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { Activity, formatDate, formatTime, truncateHash, getStatusColor } from "./types";

interface ActivityDetailsModalProps {
  activity: Activity | null;
  visible: boolean;
  onClose: () => void;
}

export default function ActivityDetailsModal({
  activity,
  visible,
  onClose,
}: ActivityDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const copyTxHash = async (hash: string) => {
    await Clipboard.setStringAsync(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  if (!activity) return null;

  const statusColors = getStatusColor(activity.status);
  const isWithdraw = activity.type === "withdraw";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white dark:bg-[#121212]">
        {/* Modal Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </Text>
          <Pressable
            onPress={handleClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Status Badge */}
          <View className="items-center mb-4">
            <View className={`px-4 py-2 rounded-full ${statusColors.bg}`}>
              <Text className={`text-sm font-semibold ${statusColors.text}`}>
                {activity.status.charAt(0).toUpperCase() +
                  activity.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View className="items-center mb-6">
            <Text
              className={`text-4xl font-bold ${
                isWithdraw
                  ? "text-red-600 dark:text-red-400"
                  : "text-accent-600 dark:text-accent-400"
              }`}
            >
              {isWithdraw ? "-" : "+"}${activity.amount.toFixed(2)}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {activity.crypto}
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
                {isWithdraw ? "Withdrawal" : "Deposit"}
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
                {isWithdraw ? "To" : "From"}
              </Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                {activity.destination || activity.source}
              </Text>
            </View>

            {/* Date */}
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Date
              </Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                {formatDate(activity.date)}
              </Text>
            </View>

            {/* Time */}
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Time
              </Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                {formatTime(activity.date)}
              </Text>
            </View>

            {/* Transaction ID */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Transaction ID
              </Text>
              <Pressable
                onPress={() => copyTxHash(activity.txHash)}
                className="flex-row items-center"
              >
                <Text className="text-gray-900 dark:text-white font-medium font-mono mr-2">
                  {truncateHash(activity.txHash)}
                </Text>
                {copied ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <Copy size={16} color="#6B7280" />
                )}
              </Pressable>
            </View>

            {/* Network Fee (only for withdrawals) */}
            {isWithdraw && (
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
      </View>
    </Modal>
  );
}
