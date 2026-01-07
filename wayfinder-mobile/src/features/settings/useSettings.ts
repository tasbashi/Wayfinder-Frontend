/**
 * useSettings Hook
 * 
 * Hook for managing app settings and accessibility preferences.
 * Wraps the existing AccessibilityContext and useLanguage hook.
 */

import { useState, useCallback } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/hooks/useLanguage';
import { initializeVoiceNavigation } from '@/utils/voiceNavigation';

export interface AppSettings {
    /** High contrast mode */
    highContrast: boolean;
    /** Larger text */
    largerText: boolean;
    /** Voice navigation enabled */
    voiceNavigation: boolean;
}

interface LanguageInfo {
    code: string;
    name: string;
    nativeName: string;
}

interface UseSettingsResult {
    /** Current settings */
    settings: AppSettings;
    /** Is screen reader active */
    isScreenReaderEnabled: boolean;
    /** Font size multiplier */
    fontSizeMultiplier: number;
    /** Current language code */
    currentLanguage: string;
    /** Supported languages */
    supportedLanguages: readonly LanguageInfo[];
    /** Settings loading state */
    isLoading: boolean;
    /** Update a single setting */
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
    /** Update multiple settings */
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    /** Change language */
    changeLanguage: (langCode: 'en' | 'tr') => Promise<void>;
    /** Reset settings to defaults */
    resetSettings: () => Promise<void>;
    /** Get current language info */
    getCurrentLanguageInfo: () => LanguageInfo;
}

export function useSettings(): UseSettingsResult {
    const {
        settings: accessibilitySettings,
        updateSettings: updateAccessibilitySettings,
        isScreenReaderEnabled,
        fontSizeMultiplier,
    } = useAccessibility();

    const {
        currentLanguage,
        setLanguage,
        supportedLanguages,
        getCurrentLanguageInfo,
    } = useLanguage();

    const [isLoading, setIsLoading] = useState(false);

    // Map accessibility context settings to app settings
    const settings: AppSettings = {
        highContrast: accessibilitySettings.highContrast,
        largerText: accessibilitySettings.largerText,
        voiceNavigation: accessibilitySettings.voiceNavigation,
    };

    const updateSetting = useCallback(
        async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            setIsLoading(true);
            try {
                await updateAccessibilitySettings({ [key]: value });

                // Initialize voice navigation if that setting changed
                if (key === 'voiceNavigation') {
                    initializeVoiceNavigation(value as boolean);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [updateAccessibilitySettings]
    );

    const updateSettings = useCallback(
        async (updates: Partial<AppSettings>) => {
            setIsLoading(true);
            try {
                await updateAccessibilitySettings(updates);

                // Initialize voice navigation if included in updates
                if (updates.voiceNavigation !== undefined) {
                    initializeVoiceNavigation(updates.voiceNavigation);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [updateAccessibilitySettings]
    );

    const changeLanguage = useCallback(
        async (langCode: 'en' | 'tr') => {
            setIsLoading(true);
            try {
                await setLanguage(langCode);
            } finally {
                setIsLoading(false);
            }
        },
        [setLanguage]
    );

    const resetSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            await updateAccessibilitySettings({
                highContrast: false,
                largerText: false,
                voiceNavigation: false,
            });
            await setLanguage('en');
            initializeVoiceNavigation(false);
        } finally {
            setIsLoading(false);
        }
    }, [updateAccessibilitySettings, setLanguage]);

    return {
        settings,
        isScreenReaderEnabled,
        fontSizeMultiplier,
        currentLanguage,
        supportedLanguages,
        isLoading,
        updateSetting,
        updateSettings,
        changeLanguage,
        resetSettings,
        getCurrentLanguageInfo,
    };
}
