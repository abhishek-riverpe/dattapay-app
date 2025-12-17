import { useSignInWithApple } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

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
          router.replace("/");
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
      <TouchableOpacity
        onPress={handleAppleSignIn}
        className="w-full h-14 bg-black dark:bg-white rounded-xl items-center justify-center flex-row mb-3"
      >
        <Text className="text-white dark:text-black text-base font-semibold">
           Sign in with Apple
        </Text>
      </TouchableOpacity>

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
