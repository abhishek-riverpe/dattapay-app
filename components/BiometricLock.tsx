import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, AppState, AppStateStatus } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Fingerprint, ShieldAlert, Clock } from "lucide-react-native";
import ThemeButton from "./ui/ThemeButton";

interface BiometricLockProps {
  children: React.ReactNode;
}

// Storage keys for persistent lockout
const LOCKOUT_ATTEMPTS_KEY = "biometric_auth_attempts";
const LOCKOUT_UNTIL_KEY = "biometric_lockout_until";
const LOCKOUT_LEVEL_KEY = "biometric_lockout_level";

// Lockout configuration
const ATTEMPTS_PER_LEVEL = 5;
// Lockout durations in milliseconds: 1min, 5min, 15min, 1hr
const LOCKOUT_DURATIONS = [
  60 * 1000,         // Level 1: 1 minute
  5 * 60 * 1000,     // Level 2: 5 minutes
  15 * 60 * 1000,    // Level 3: 15 minutes
  60 * 60 * 1000,    // Level 4: 1 hour
];

export default function BiometricLock({ children }: BiometricLockProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [securityAvailable, setSecurityAvailable] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lockoutLevel, setLockoutLevel] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persistent lockout state
  const loadLockoutState = useCallback(async () => {
    try {
      const attempts = await SecureStore.getItemAsync(LOCKOUT_ATTEMPTS_KEY);
      const until = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
      const level = await SecureStore.getItemAsync(LOCKOUT_LEVEL_KEY);

      if (attempts) setAuthAttempts(parseInt(attempts, 10));
      if (level) setLockoutLevel(parseInt(level, 10));

      if (until) {
        const untilTime = parseInt(until, 10);
        if (untilTime > Date.now()) {
          setLockoutUntil(untilTime);
        } else {
          // Lockout expired, clear it
          await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
          setLockoutUntil(null);
        }
      }
    } catch {
      // Ignore errors loading lockout state
    }
    setIsInitialized(true);
  }, []);

  // Save lockout state to persistent storage
  const saveLockoutState = useCallback(async (attempts: number, level: number, until: number | null) => {
    try {
      await SecureStore.setItemAsync(LOCKOUT_ATTEMPTS_KEY, attempts.toString());
      await SecureStore.setItemAsync(LOCKOUT_LEVEL_KEY, level.toString());
      if (until) {
        await SecureStore.setItemAsync(LOCKOUT_UNTIL_KEY, until.toString());
      } else {
        await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
      }
    } catch {
      // Ignore errors saving lockout state
    }
  }, []);

  // Reset lockout state on successful auth
  const resetLockoutState = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(LOCKOUT_ATTEMPTS_KEY);
      await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
      await SecureStore.deleteItemAsync(LOCKOUT_LEVEL_KEY);
    } catch {
      // Ignore errors
    }
    setAuthAttempts(0);
    setLockoutLevel(0);
    setLockoutUntil(null);
    setRemainingTime(null);
  }, []);

  // Format remaining time for display
  const formatRemainingTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Check and update lockout timer
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const remaining = lockoutUntil - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setRemainingTime(null);
      } else {
        setRemainingTime(formatRemainingTime(remaining));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  useEffect(() => {
    loadLockoutState();
    checkBiometricSupport();
  }, [loadLockoutState]);

  // Only authenticate after initialization
  useEffect(() => {
    if (isInitialized && !lockoutUntil) {
      authenticate();
    }
  }, [isInitialized]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, lockoutUntil]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active" && !isAuthenticated && !lockoutUntil) {
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

  // Handle failed authentication attempt with exponential backoff
  const handleFailedAttempt = async () => {
    const newAttempts = authAttempts + 1;
    setAuthAttempts(newAttempts);

    // Check if we should trigger a lockout
    if (newAttempts >= ATTEMPTS_PER_LEVEL) {
      const newLevel = Math.min(lockoutLevel + 1, LOCKOUT_DURATIONS.length);
      const duration = LOCKOUT_DURATIONS[newLevel - 1];
      const until = Date.now() + duration;

      setLockoutLevel(newLevel);
      setLockoutUntil(until);
      await saveLockoutState(0, newLevel, until); // Reset attempts for next round
      setAuthAttempts(0);

      const durationText = newLevel === 1 ? "1 minute" :
                          newLevel === 2 ? "5 minutes" :
                          newLevel === 3 ? "15 minutes" : "1 hour";
      setError(`Too many failed attempts. Please wait ${durationText} before trying again.`);
    } else {
      await saveLockoutState(newAttempts, lockoutLevel, null);
    }
  };

  const authenticate = async () => {
    if (isAuthenticating) return;

    // Check if currently locked out
    if (lockoutUntil && lockoutUntil > Date.now()) {
      setError(`Please wait ${remainingTime} before trying again.`);
      return;
    }

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
        await resetLockoutState();
      } else if (result.error === "user_cancel") {
        await handleFailedAttempt();
        if (!lockoutUntil) {
          setError("Authentication cancelled");
        }
      } else if (result.error === "user_fallback") {
        setError(null);
      } else if (result.error === "not_enrolled") {
        setSecurityAvailable(false);
        setError("Please set up biometric authentication or a device passcode to use DattaPay.");
      } else {
        await handleFailedAttempt();
        if (!lockoutUntil) {
          setError("Authentication failed. Please try again.");
        }
      }
    } catch {
      await handleFailedAttempt();
      if (!lockoutUntil) {
        setError("An error occurred during authentication");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const isLockedOut = lockoutUntil && lockoutUntil > Date.now();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-8">
          {isLockedOut ? (
            <Clock size={48} color="#F59E0B" />
          ) : securityAvailable ? (
            <Fingerprint size={48} color="#005AEE" />
          ) : (
            <ShieldAlert size={48} color="#EF4444" />
          )}
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {isLockedOut
            ? "Temporarily Locked"
            : securityAvailable
              ? "Authentication Required"
              : "Security Required"}
        </Text>

        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-8">
          {isLockedOut
            ? "Too many failed attempts"
            : securityAvailable
              ? `Use ${biometricType} to unlock DattaPay`
              : "Please set up device security to use DattaPay"}
        </Text>

        {/* Lockout Timer Display */}
        {isLockedOut && remainingTime && (
          <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 w-full">
            <View className="flex-row items-center justify-center">
              <Clock size={20} color="#F59E0B" />
              <Text className="text-amber-700 dark:text-amber-400 text-lg font-bold ml-2">
                {remainingTime}
              </Text>
            </View>
            <Text className="text-amber-600 dark:text-amber-300 text-sm text-center mt-2">
              Please wait before trying again
            </Text>
          </View>
        )}

        {error && !isLockedOut && (
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
              disabled={isAuthenticating || !!isLockedOut}
            >
              {isAuthenticating
                ? "Authenticating..."
                : isLockedOut
                  ? "Please Wait"
                  : `Unlock with ${biometricType}`}
            </ThemeButton>

            {!isLockedOut && authAttempts > 0 && (
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                {ATTEMPTS_PER_LEVEL - authAttempts} attempts remaining
              </Text>
            )}

            {!isLockedOut && (
              <Pressable onPress={authenticate} className="mt-4" disabled={isAuthenticating}>
                <Text className="text-primary text-sm font-medium">
                  Try Again
                </Text>
              </Pressable>
            )}
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
