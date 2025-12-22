import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import useCurrentUser from "@/hooks/useCurrentUser";
import { View, ActivityIndicator } from "react-native";

export default function AccountSetupLayout() {
  const { isSignedIn } = useAuth();
  const { data: currentUserResponse, isLoading } = useCurrentUser();
  const currentUser = currentUserResponse?.data;
  const segments = useSegments();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Only redirect if NOT loading AND no currentUser
  const currentScreen = segments[segments.length - 1];
  if (!isLoading && !currentUser && currentScreen !== "complete-account") {
    return <Redirect href="/(account)/complete-account" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="complete-account" />
      <Stack.Screen name="complete-address" />
      <Stack.Screen name="complete-kyc" />
      <Stack.Screen name="submit-account" />
    </Stack>
  );
}
