import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import useAccount from "@/hooks/useAccount";

export default function AccountSetupLayout() {
  const { isSignedIn } = useAuth();
  const { data: currentUserResponse, isLoading } = useAccount();
  const currentUser = currentUserResponse?.data;
  const segments = useSegments();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Only redirect if NOT loading AND no user data
  const currentScreen = segments[segments.length - 1];
  if (!isLoading && !currentUser?.user && currentScreen !== "complete-account") {
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
