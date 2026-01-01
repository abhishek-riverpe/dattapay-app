import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import ThemeButton from "@/components/ui/ThemeButton";
import { useKycStore } from "@/store";
import { clearAdminToken } from "@/lib/token-generator";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearKycData } = useKycStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearAdminToken();
      queryClient.clear();
      clearKycData();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <ThemeButton
      variant="destructive"
      size="md"
      onPress={handleSignOut}
      leftIcon={<Text className="text-red-600 dark:text-red-400">↪</Text>}
    >
      Sign out
    </ThemeButton>
  );
}
