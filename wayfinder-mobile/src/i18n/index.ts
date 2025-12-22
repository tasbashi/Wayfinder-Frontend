import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import tr from './locales/tr.json';

const LANGUAGE_KEY = '@wayfinder/language';

// Get stored language or fallback to device locale
const getInitialLanguage = async (): Promise<string> => {
    try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (storedLanguage) {
            return storedLanguage;
        }
    } catch (error) {
        console.warn('Error reading stored language:', error);
    }

    // Get device locale and extract language code
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    return ['tr', 'en'].includes(deviceLocale) ? deviceLocale : 'en';
};

// Initialize i18next
const initI18n = async () => {
    const initialLanguage = await getInitialLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            resources: {
                en: { translation: en },
                tr: { translation: tr },
            },
            lng: initialLanguage,
            fallbackLng: 'en',
            compatibilityJSON: 'v4',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });

    return i18n;
};

// Change language and persist
export const changeLanguage = async (language: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
        await i18n.changeLanguage(language);
        // Notify all listeners about language change
        languageChangeListeners.forEach(listener => {
            try {
                listener(language);
            } catch (error) {
                console.warn('Error in language change listener:', error);
            }
        });
    } catch (error) {
        console.error('Error changing language:', error);
    }
};

// Language change listeners for components that need to refetch data
type LanguageChangeListener = (language: string) => void;
const languageChangeListeners: LanguageChangeListener[] = [];

/**
 * Register a listener to be called when the language changes.
 * Useful for refetching API data when language changes.
 * @returns Cleanup function to remove the listener
 */
export const addLanguageChangeListener = (listener: LanguageChangeListener): (() => void) => {
    languageChangeListeners.push(listener);
    return () => {
        const index = languageChangeListeners.indexOf(listener);
        if (index > -1) {
            languageChangeListeners.splice(index, 1);
        }
    };
};

// Get current language
export const getCurrentLanguage = (): string => {
    return i18n.language || 'en';
};

// Supported languages
export const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

export { initI18n };
export default i18n;
