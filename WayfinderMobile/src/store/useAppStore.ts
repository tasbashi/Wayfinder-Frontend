import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportedLanguage, Theme } from "@/config/app.config";

interface AppStore {
    // State
    theme: Theme;
    language: SupportedLanguage;
    isAccessibilityMode: boolean;
    hasSeenOnboarding: boolean;

    // Actions
    setTheme: (theme: Theme) => void;
    setLanguage: (language: SupportedLanguage) => void;
    toggleAccessibilityMode: () => void;
    setHasSeenOnboarding: (seen: boolean) => void;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            // Initial State
            theme: "system",
            language: "tr",
            isAccessibilityMode: false,
            hasSeenOnboarding: false,

            // Actions
            setTheme: (theme) => set({ theme }),

            setLanguage: (language) => set({ language }),

            toggleAccessibilityMode: () =>
                set((state) => ({
                    isAccessibilityMode: !state.isAccessibilityMode,
                })),

            setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
        }),
        {
            name: "wayfinder-app-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
