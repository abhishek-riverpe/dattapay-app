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
import { countries } from "@/constants/countries";
import { ChevronDown, Search, X } from "lucide-react-native";

type CountrySelectorProps = {
  value: string;
  onSelect: (code: string) => void;
  label?: string;
  errorMessage?: string;
};

export default function CountrySelector({
  value,
  onSelect,
  label,
  errorMessage,
}: CountrySelectorProps) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry = countries.find((c) => c.code === value);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelect(code);
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
        <Text
          className={`text-base ${
            selectedCountry
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {selectedCountry ? selectedCountry.name : "Select country"}
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
                placeholder="Search country..."
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
                onPress={() => handleSelect(item.code)}
                className={`flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                  selectedCountry?.code === item.code ? "bg-primary/10" : ""
                }`}
              >
                <Text className="text-gray-900 dark:text-white text-base">
                  {item.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.code}
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
