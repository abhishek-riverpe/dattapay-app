import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Activity, DUMMY_ACTIVITIES } from "@/components/activity/types";
import ActivityItem from "@/components/activity/ActivityItem";
import ActivityDetailsModal from "@/components/activity/ActivityDetailsModal";

export default function ActivityScreen() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

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
            {DUMMY_ACTIVITIES.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onPress={() => setSelectedActivity(activity)}
                isLast={index === DUMMY_ACTIVITIES.length - 1}
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
