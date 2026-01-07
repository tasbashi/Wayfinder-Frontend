/**
 * Settings Store
 * 
 * Global state for app settings using Zustand.
 * Persists settings using AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@wayfinder/settings';

export interface SettingsState {
    // Appearance
    highContrast: boolean;
    largerText: boolean;
    darkMode: boolean;

    // Navigation
    voiceNavigation: boolean;
    hapticFeedback: boolean;

    // Accessibility
    reduceMotion: boolean;

    // Language
    language: 'en' | 'tr';

    // Status
    isLoaded: boolean;

    // Actions
    loadSettings: () => Promise<void>;
    updateSetting: <K extends keyof Omit<SettingsState, 'isLoaded' | 'loadSettings' | 'updateSetting' | 'resetSettings'>>(
        key: K,
        value: SettingsState[K]
    ) => Promise<void>;
    resetSettings: () => Promise<void>;
}

const defaultSettings = {
    highContrast: false,
    largerText: false,
    darkMode: false,
    voiceNavigation: false,
    hapticFeedback: true,
    reduceMotion: false,
    language: 'en' as const,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    // Initial state
    ...defaultSettings,
    isLoaded: false,

    // Load settings from storage
    loadSettings: async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                set({ ...parsed, isLoaded: true });
            } else {
                set({ isLoaded: true });
            }
        } catch (error) {
            console.error('[SettingsStore] Failed to load settings:', error);
            set({ isLoaded: true });
        }
    },

    // Update a single setting
    updateSetting: async (key, value) => {
        set({ [key]: value });

        // Persist to storage
        try {
            const state = get();
            const toStore = {
                highContrast: state.highContrast,
                largerText: state.largerText,
                darkMode: state.darkMode,
                voiceNavigation: state.voiceNavigation,
                hapticFeedback: state.hapticFeedback,
                reduceMotion: state.reduceMotion,
                language: state.language,
            };
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toStore));
        } catch (error) {
            console.error('[SettingsStore] Failed to save settings:', error);
        }
    },

    // Reset to defaults
    resetSettings: async () => {
        set({ ...defaultSettings });

        try {
            await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        } catch (error) {
            console.error('[SettingsStore] Failed to reset settings:', error);
        }
    },
}));

/**
 * Hook to load settings on app start
 */
export function useLoadSettings() {
    const loadSettings = useSettingsStore((state) => state.loadSettings);
    const isLoaded = useSettingsStore((state) => state.isLoaded);

    return { loadSettings, isLoaded };
}
