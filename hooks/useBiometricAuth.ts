import * as LocalAuthentication from "expo-local-authentication";

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export default function useBiometricAuth() {
  const authenticate = async (
    promptMessage = "Authenticate to continue"
  ): Promise<BiometricAuthResult> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: true };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: true };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      }

      if (result.error === "user_cancel") {
        return { success: false, error: "Authentication cancelled" };
      }

      return { success: false, error: "Authentication failed" };
    } catch {
      return { success: false, error: "An error occurred" };
    }
  };

  return { authenticate };
}
