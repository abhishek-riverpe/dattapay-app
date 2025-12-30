import { View, Text, Pressable } from "react-native";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { Activity, formatDate, getStatusColor } from "./types";

interface ActivityItemProps {
  activity: Activity;
  onPress: () => void;
  isLast: boolean;
}

export default function ActivityItem({
  activity,
  onPress,
  isLast,
}: ActivityItemProps) {
  const statusColors = getStatusColor(activity.status);
  const isWithdraw = activity.type === "withdraw";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 ${
        !isLast ? "border-b border-gray-100 dark:border-gray-800" : ""
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
        <View className={`px-2 py-0.5 rounded-full mt-1 ${statusColors.bg}`}>
          <Text className={`text-xs font-medium ${statusColors.text}`}>
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
