import { useSignInWithApple } from "@clerk/clerk-expo";
import { Platform, Text, View } from "react-native";
import ThemeButton from "@/components/ui/ThemeButton";
import useSocialAuth from "@/hooks/useSocialAuth";

interface AppleSignInButtonProps {
  onSignInComplete?: () => void;
  showDivider?: boolean;
}

export default function AppleSignInButton({
  onSignInComplete,
  showDivider = true,
}: Readonly<AppleSignInButtonProps>) {
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const { handleAuthResult, handleAuthError } = useSocialAuth({
    onSignInComplete,
    providerName: "Apple",
  });

  if (Platform.OS !== "ios") {
    return null;
  }

  const handleAppleSignIn = async () => {
    try {
      const result = await startAppleAuthenticationFlow();
      await handleAuthResult(result);
    } catch (err) {
      handleAuthError(err);
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
