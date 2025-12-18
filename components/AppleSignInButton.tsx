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
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        return;
      }

      Alert.alert(
        "Error",
        err.message || "An error occurred during Apple Sign-In"
      );
      console.error("Apple Sign-In error:", JSON.stringify(err, null, 2));
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
