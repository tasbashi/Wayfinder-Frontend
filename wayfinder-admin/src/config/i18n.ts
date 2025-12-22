import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import tr from '../locales/tr.json';

export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language labels for display
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
    en: 'English',
    tr: 'Türkçe',
};

// Detect initial language
function getInitialLanguage(): SupportedLanguage {
    if (typeof window === 'undefined') return 'en';

    // 1. Check localStorage for saved preference
    const stored = localStorage.getItem('preferredLanguage');
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
        return stored as SupportedLanguage;
    }

    // 2. Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
        return browserLang as SupportedLanguage;
    }

    // 3. Default to English
    return 'en';
}

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        tr: { translation: tr },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
        escapeValue: false, // React already handles escaping
    },
    react: {
        useSuspense: false, // Disable suspense for SSR compatibility
    },
});

export default i18n;
