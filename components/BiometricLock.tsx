import { useEffect, useState } from "react";
import { View, Text, Pressable, AppState, AppStateStatus } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint, ShieldAlert } from "lucide-react-native";
import ThemeButton from "./ui/ThemeButton";

interface BiometricLockProps {
  children: React.ReactNode;
}

export default function BiometricLock({ children }: BiometricLockProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [securityAvailable, setSecurityAvailable] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
    authenticate();

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active" && !isAuthenticated) {
      authenticate();
    }
    if (nextAppState === "background") {
      setIsAuthenticated(false);
    }
  };

  const checkBiometricSupport = async () => {
    const types =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
    const hasHardware = await LocalAuthentication.hasHardwareAsync();

    // Check if any device security is available
    setSecurityAvailable(
      hasHardware || securityLevel !== LocalAuthentication.SecurityLevel.NONE
    );

    if (
      types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      setBiometricType("Face ID");
    } else if (
      types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      setBiometricType("Fingerprint");
    } else if (
      types.includes(LocalAuthentication.AuthenticationType.IRIS)
    ) {
      setBiometricType("Iris");
    } else {
      setBiometricType("Passcode");
    }
  };

  const authenticate = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      // Do NOT auto-bypass - require device security
      if (!hasHardware && securityLevel === LocalAuthentication.SecurityLevel.NONE) {
        setSecurityAvailable(false);
        setError("Device security is required. Please set up a passcode or biometric authentication in your device settings.");
        setIsAuthenticating(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access DattaPay",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else if (result.error === "user_cancel") {
        setError("Authentication cancelled");
      } else if (result.error === "user_fallback") {
        setError(null);
      } else if (result.error === "not_enrolled") {
        setSecurityAvailable(false);
        setError("Please set up biometric authentication or a device passcode to use DattaPay.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during authentication");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-8">
          {securityAvailable ? (
            <Fingerprint size={48} color="#005AEE" />
          ) : (
            <ShieldAlert size={48} color="#EF4444" />
          )}
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {securityAvailable ? "Authentication Required" : "Security Required"}
        </Text>

        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-8">
          {securityAvailable
            ? `Use ${biometricType} to unlock DattaPay`
            : "Please set up device security to use DattaPay"}
        </Text>

        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 w-full">
            <Text className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </Text>
          </View>
        )}

        {securityAvailable ? (
          <>
            <ThemeButton
              variant="primary"
              onPress={authenticate}
              loading={isAuthenticating}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Authenticating..." : `Unlock with ${biometricType}`}
            </ThemeButton>

            <Pressable onPress={authenticate} className="mt-4">
              <Text className="text-primary text-sm font-medium">
                Try Again
              </Text>
            </Pressable>
          </>
        ) : (
          <View className="w-full">
            <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <Text className="text-amber-700 dark:text-amber-400 text-sm text-center">
                To protect your funds, DattaPay requires device security. Please
                go to your device settings and set up a passcode, fingerprint, or
                Face ID.
              </Text>
            </View>
            <ThemeButton
              variant="secondary"
              onPress={authenticate}
              className="mt-4"
            >
              Check Again
            </ThemeButton>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
