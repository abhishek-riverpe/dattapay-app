import { useSignInWithApple } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Platform, Text, View } from "react-native";
import ThemeButton from "@/components/ui/ThemeButton";

interface AppleSignInButtonProps {
  onSignInComplete?: () => void;
  showDivider?: boolean;
}

export default function AppleSignInButton({
  onSignInComplete,
  showDivider = true,
}: AppleSignInButtonProps) {
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const router = useRouter();

  if (Platform.OS !== "ios") {
    return null;
  }

  const handleAppleSignIn = async () => {
    try {
      const { createdSessionId, setActive } =
        await startAppleAuthenticationFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        if (onSignInComplete) {
          onSignInComplete();
        } else {
          router.replace("/(account)/complete-account");
        }
      }
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }

      Alert.alert(
        "Error",
        error.message || "An error occurred during Apple Sign-In"
      );
      if (__DEV__) {
        console.error("Apple Sign-In error:", error.message || "Unknown error");
      }
    }
  };

  return (
    <>
      <ThemeButton variant="apple" size="lg" onPress={handleAppleSignIn} className="mb-3">
         Sign in with Apple
      </ThemeButton>

      {showDivider && (
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
            OR
          </Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </View>
      )}
    </>
  );
}
