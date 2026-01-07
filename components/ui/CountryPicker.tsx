import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { countries, Country } from "@/constants/countries";
import { ChevronDown, Search, X } from "lucide-react-native";

type CountryPickerProps = {
  value: string;
  onSelect: (country: Country) => void;
  label?: string;
  errorMessage?: string;
  /**
   * Which field to show in the input (dial code by default).
   * Use "name" when selecting nationality.
   */
  displayField?: "dialCode" | "name";
  /**
   * Which field to match the current value against (dialCode by default).
   */
  valueField?: "dialCode" | "code";
};

export default function CountryPicker({
  value,
  onSelect,
  label,
  errorMessage,
  displayField = "dialCode",
  valueField = "dialCode",
}: CountryPickerProps) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry = countries.find((c) => {
    if (valueField === "dialCode") {
      return c.dialCode === value || c.dialCode === `+${value}`;
    }
    return c.code === value;
  });

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dialCode.includes(search)
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setVisible(false);
    setSearch("");
  };

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => setVisible(true)}
        className={`flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-4 ${
          errorMessage ? "border border-red-500" : ""
        }`}
      >
        <Text className="text-gray-900 dark:text-white text-base">
          {selectedCountry
            ? displayField === "name"
              ? selectedCountry.name
              : selectedCountry.dialCode
            : "Select country"}
        </Text>
        <ChevronDown size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
      </Pressable>

      {errorMessage && (
        <Text className="text-red-500 text-xs mt-1">{errorMessage}</Text>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-white dark:bg-[#121212]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Country
            </Text>
            <Pressable onPress={() => setVisible(false)}>
              <X size={24} color={isDark ? "#fff" : "#000"} />
            </Pressable>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
              <Search size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search country or code..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
              />
            </View>
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className={`flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                  selectedCountry?.code === item.code ? "bg-primary/10" : ""
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-gray-900 dark:text-white text-base">
                    {item.name}
                  </Text>
                </View>
                <Text className="text-gray-500 dark:text-gray-400 text-base ml-2">
                  {item.dialCode}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  No countries found
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
