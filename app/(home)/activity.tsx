import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Activity } from "@/components/activity/types";
import ActivityItem from "@/components/activity/ActivityItem";
import ActivityDetailsModal from "@/components/activity/ActivityDetailsModal";
import { useActivities } from "@/hooks/useActivities";

export default function ActivityScreen() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const { data: activities, isLoading, isError } = useActivities();

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
            {isLoading && (
              <View className="items-center py-6">
                <ActivityIndicator />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  Loading activities...
                </Text>
              </View>
            )}

            {isError && !isLoading && (
              <View className="items-center py-6 px-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  Unable to load activities
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Please try again later.
                </Text>
              </View>
            )}

            {!isLoading && !isError && activities?.length === 0 && (
              <View className="items-center py-6 px-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  No activity yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Your transactions will appear here.
                </Text>
              </View>
            )}

            {!isLoading &&
              !isError &&
              activities?.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onPress={() => setSelectedActivity(activity)}
                  isLast={index === (activities?.length ?? 0) - 1}
                />
              ))}
          </View>
        </ScrollView>
      </View>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        visible={selectedActivity !== null}
        onClose={() => setSelectedActivity(null)}
      />
    </SafeAreaView>
  );
}
