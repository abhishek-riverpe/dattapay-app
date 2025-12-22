import { TouchableOpacity, View, Text } from "react-native";

type ActionColor = "primary" | "blue" | "purple" | "orange" | "gray";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color?: ActionColor;
  onPress?: () => void;
}

const colorStyles: Record<ActionColor, string> = {
  primary: "bg-primary-100 dark:bg-primary-900",
  blue: "bg-blue-100 dark:bg-blue-900",
  purple: "bg-purple-100 dark:bg-purple-900",
  orange: "bg-orange-100 dark:bg-orange-900",
  gray: "bg-gray-100 dark:bg-gray-800",
};

export default function QuickAction({
  icon,
  label,
  color = "gray",
  onPress,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${colorStyles[color]}`}
      >
        {typeof icon === "string" ? (
          <Text className="text-2xl font-semibold dark:text-white">{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
