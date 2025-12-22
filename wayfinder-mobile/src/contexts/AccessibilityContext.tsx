import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AccessibilitySettings {
  highContrast: boolean;
  largerText: boolean;
  voiceNavigation: boolean;
  screenReaderEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => Promise<void>;
  isScreenReaderEnabled: boolean;
  fontSizeMultiplier: number;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = "wayfinder_accessibility_settings";

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largerText: false,
  voiceNavigation: false,
  screenReaderEnabled: false,
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener("screenReaderChanged", (enabled) => {
      setIsScreenReaderEnabled(enabled);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AccessibilitySettings;
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load accessibility settings:", error);
    }
  }

  async function checkScreenReader() {
    const enabled = await AccessibilityInfo.isScreenReaderEnabled();
    setIsScreenReaderEnabled(enabled);
  }

  async function updateSettings(newSettings: Partial<AccessibilitySettings>) {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save accessibility settings:", error);
    }
  }

  const fontSizeMultiplier = settings.largerText ? 1.3 : 1.0;

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        isScreenReaderEnabled: isScreenReaderEnabled || settings.screenReaderEnabled,
        fontSizeMultiplier,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

