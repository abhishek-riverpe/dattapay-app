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
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      // Check if device has any security (biometric or passcode)
      if (!hasHardware && securityLevel === LocalAuthentication.SecurityLevel.NONE) {
        return {
          success: false,
          error: "Device security is required. Please set up a passcode or biometric authentication.",
        };
      }

      // Use device authentication (biometric + passcode fallback)
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Allow passcode fallback
      });

      if (result.success) {
        return { success: true };
      }

      if (result.error === "user_cancel") {
        return { success: false, error: "Authentication cancelled" };
      }

      if (result.error === "not_enrolled") {
        return {
          success: false,
          error: "Please set up biometric authentication or a device passcode",
        };
      }

      return { success: false, error: "Authentication failed" };
    } catch {
      return { success: false, error: "An error occurred during authentication" };
    }
  };

  const checkSecurityAvailable = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      return hasHardware || securityLevel !== LocalAuthentication.SecurityLevel.NONE;
    } catch {
      return false;
    }
  };

  return { authenticate, checkSecurityAvailable };
}
