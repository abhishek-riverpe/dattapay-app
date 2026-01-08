import SignOutButton from "@/components/SignOutButton";
import ActivityDetailsModal from "@/components/activity/ActivityDetailsModal";
import ActivityItem from "@/components/activity/ActivityItem";
import { Activity } from "@/components/activity/types";
import BankDetailsModal from "@/components/funds/BankDetailsModal";
import WithdrawModal from "@/components/funds/WithdrawModal";
import QuickAction from "@/components/ui/QuickAction";
import ThemeButton from "@/components/ui/ThemeButton";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useActivities } from "@/hooks/useActivities";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy avatar for demo
const DUMMY_AVATAR = require("@/assets/images/avatar_2.jpg");

// Dummy balance for demo
const AVAILABLE_BALANCE = 500;

export default function HomeScreen() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useActivities();
  const isAccountActive = user?.data?.accountStatus === "ACTIVE";

  // Get first 3 activities for recent activity section
  const recentActivities = (activities || []).slice(0, 10);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-primary px-6 pt-4 pb-8 rounded-b-3xl">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-primary-100 text-sm">Welcome back</Text>
              <Text className="text-white text-xl font-bold">
                {user?.data.firstName || user?.data.email}
              </Text>
            </View>
            <Pressable onPress={() => setShowDropdown(true)}>
              <Image
                source={DUMMY_AVATAR}
                className="w-10 h-10 rounded-full"
              />
            </Pressable>
          </View>

          {/* Balance Card */}
          <View className="bg-white/10 rounded-2xl p-5">
            <Text className="text-primary-100 text-sm mb-1">Total Balance</Text>
            <Text className="text-white text-4xl font-bold">$0.00</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 -mt-4">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex-row justify-around">
            <QuickAction
              icon="↓"
              label="Get Paid"
              color="primary"
              onPress={() => setShowBankDetails(true)}
            />
            <QuickAction
              icon="↑"
              label="Withdraw"
              color="orange"
              onPress={() => setShowWithdraw(true)}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mt-6 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Recent Activity
            </Text>
            <ThemeButton
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={() => router.push("/(home)/activity")}
            >
              See All
            </ThemeButton>
          </View>

          <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            {activitiesLoading && (
              <View className="items-center py-6">
                <ActivityIndicator />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  Loading activities...
                </Text>
              </View>
            )}

            {activitiesError && !activitiesLoading && (
              <View className="items-center py-6 px-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  Unable to load activities
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Please try again later.
                </Text>
              </View>
            )}

            {!activitiesLoading &&
              !activitiesError &&
              recentActivities.length === 0 && (
                <View className="items-center py-6 px-4">
                  <Text className="text-gray-700 dark:text-gray-300 font-medium">
                    No activity yet
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Your recent transactions will show here.
                  </Text>
                </View>
              )}

            {!activitiesLoading &&
              !activitiesError &&
              recentActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onPress={() => setSelectedActivity(activity)}
                  isLast={index === recentActivities.length - 1}
                />
              ))}
          </View>
        </View>
      </ScrollView>

      {/* Profile Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable className="flex-1" onPress={() => setShowDropdown(false)}>
          <View className="absolute top-20 right-6 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg min-w-[220px]">
            {/* User Info */}
            <View className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <Text className="text-gray-900 dark:text-white font-semibold">
                {user?.data.firstName} {user?.data.lastName}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {user?.data.email}
              </Text>
            </View>

            {/* Account Not Submitted Warning */}
            {!isAccountActive && user?.data && (
              <Pressable
                onPress={() => {
                  setShowDropdown(false);
                  router.push("/(account)/submit-account");
                }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-3"
              >
                <View className="flex-row items-center mb-1">
                  <AlertTriangle size={16} color="#f59e0b" />
                  <Text className="text-amber-800 dark:text-amber-300 text-xs font-medium ml-1">
                    Account Not Submitted
                  </Text>
                </View>
                <Text className="text-amber-600 dark:text-amber-300 text-xs underline">
                  Submit Now
                </Text>
              </Pressable>
            )}

            {/* Logout */}
            <SignOutButton />
          </View>
        </Pressable>
      </Modal>

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

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        visible={selectedActivity !== null}
        onClose={() => setSelectedActivity(null)}
      />
    </SafeAreaView>
  );
}
