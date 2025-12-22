import { Redirect } from "expo-router";
import useCurrentUser from "@/hooks/useCurrentUser";
import { View, ActivityIndicator } from "react-native";

export default function AccountIndex() {
  const { data: currentUserResponse, isLoading } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#005AEE" />
      </View>
    );
  }

  // No user data - go to complete account
  if (!currentUser) {
    return <Redirect href="/(account)/complete-account" />;
  }

  // Has user data but no address - go to complete address
  if (!currentUser.address) {
    return <Redirect href="/(account)/complete-address" />;
  }

  // Has both but account status is PENDING - go to complete kyc
  if (currentUser.accountStatus === "PENDING") {
    return <Redirect href="/(account)/complete-kyc" />;
  }

  // All complete - go to home
  return <Redirect href="/(home)" />;
}
