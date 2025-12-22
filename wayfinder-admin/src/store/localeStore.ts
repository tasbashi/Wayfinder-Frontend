import { create } from 'zustand';
import i18n from '../config/i18n';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, SupportedLanguage } from '../config/i18n';

interface LocaleStore {
    language: SupportedLanguage;
    supportedLanguages: readonly SupportedLanguage[];
    isChangingLanguage: boolean;

    /**
     * Change the current language
     * Updates i18n, persists to localStorage, and triggers data refetch
     */
    setLanguage: (lang: SupportedLanguage) => Promise<void>;

    /**
     * Get display label for a language code
     */
    getLanguageLabel: (code: SupportedLanguage) => string;
}

export const useLocale = create<LocaleStore>((set) => ({
    language: (i18n.language as SupportedLanguage) || 'en',
    supportedLanguages: SUPPORTED_LANGUAGES,
    isChangingLanguage: false,

    setLanguage: async (lang) => {
        set({ isChangingLanguage: true });

        try {
            // Update i18next
            await i18n.changeLanguage(lang);

            // Persist preference
            if (typeof window !== 'undefined') {
                localStorage.setItem('preferredLanguage', lang);
            }

            set({ language: lang, isChangingLanguage: false });

            // Note: Data refetch should be handled by components/React Query
            // when they detect the language change
        } catch (error) {
            console.error('Failed to change language:', error);
            set({ isChangingLanguage: false });
        }
    },

    getLanguageLabel: (code) => {
        return LANGUAGE_LABELS[code] || code;
    },
}));
