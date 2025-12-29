import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/context/ThemeContext";
import { Calendar } from "lucide-react-native";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  errorMessage?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePicker({
  label,
  value,
  onChange,
  errorMessage,
  placeholder = "Select date",
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const currentDate = value ? new Date(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      onChange(formattedDate);
      if (Platform.OS === "ios") {
        setShowPicker(false);
      }
    } else if (event.type === "dismissed") {
      setShowPicker(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasError = !!errorMessage;

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => setShowPicker(true)}
        className={`w-full h-14 px-4 bg-gray-50 dark:bg-gray-900 border rounded-xl flex-row items-center justify-between ${
          hasError
            ? "border-red-500 dark:border-red-500"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <Text
          className={
            value
              ? "text-gray-900 dark:text-white text-base"
              : "text-gray-400 dark:text-gray-500 text-base"
          }
        >
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Calendar size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
      </Pressable>

      {errorMessage && (
        <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
          {errorMessage}
        </Text>
      )}

      {showPicker && (
        <>
          {Platform.OS === "ios" && (
            <View className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
              <View className="flex-row justify-end px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text className="text-blue-500 font-medium">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                themeVariant={isDark ? "dark" : "light"}
              />
            </View>
          )}

          {Platform.OS === "android" && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display="default"
              onChange={handleChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
            />
          )}
        </>
      )}
    </View>
  );
}
