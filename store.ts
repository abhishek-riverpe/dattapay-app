import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

// Custom secure storage adapter for Zustand
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // SecureStore has a 2048 byte limit, handle gracefully
      console.warn("Failed to store data in SecureStore");
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore removal errors
    }
  },
};

interface KycState {
  kycLink: string | null;
  tosLink: string | null;
  kycStatus: string | null;
  tosStatus: string | null;
  setKycData: (data: {
    kycLink: string;
    tosLink: string;
    kycStatus: string;
    tosStatus: string;
  }) => void;
  clearKycData: () => void;
}

export const useKycStore = create<KycState>()(
  persist(
    (set) => ({
      kycLink: null,
      tosLink: null,
      kycStatus: null,
      tosStatus: null,
      setKycData: (data) =>
        set({
          kycLink: data.kycLink,
          tosLink: data.tosLink,
          kycStatus: data.kycStatus,
          tosStatus: data.tosStatus,
        }),
      clearKycData: () =>
        set({
          kycLink: null,
          tosLink: null,
          kycStatus: null,
          tosStatus: null,
        }),
    }),
    {
      name: "kyc-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
