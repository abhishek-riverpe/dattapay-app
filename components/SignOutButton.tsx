import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="w-full h-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl items-center justify-center flex-row"
    >
      <View className="mr-2">
        <Text className="text-red-600 dark:text-red-400">↪</Text>
      </View>
      <Text className="text-red-600 dark:text-red-400 text-sm font-semibold">
        Sign out
      </Text>
    </TouchableOpacity>
  );
}
