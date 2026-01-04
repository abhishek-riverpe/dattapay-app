import { useRouter } from "expo-router";
import { Alert } from "react-native";

interface SocialAuthResult {
  createdSessionId?: string;
  setActive?: (params: { session: string }) => Promise<void>;
}

interface UseSocialAuthOptions {
  onSignInComplete?: () => void;
  providerName: string;
}

export default function useSocialAuth({
  onSignInComplete,
  providerName,
}: Readonly<UseSocialAuthOptions>) {
  const router = useRouter();

  const handleAuthResult = async (result: SocialAuthResult) => {
    if (result.createdSessionId && result.setActive) {
      await result.setActive({ session: result.createdSessionId });
      if (onSignInComplete) {
        onSignInComplete();
      } else {
        router.replace("/(account)/complete-account");
      }
      return true;
    }
    return false;
  };

  const handleAuthError = (err: unknown) => {
    const error = err as { code?: string; message?: string };
    if (error.code === "ERR_REQUEST_CANCELED") {
      return;
    }
    Alert.alert(
      "Error",
      error.message || `An error occurred during ${providerName} Sign-In`
    );
    if (__DEV__) {
      console.error(
        `${providerName} Sign-In error:`,
        error.message || "Unknown error"
      );
    }
  };

  return { handleAuthResult, handleAuthError };
}
