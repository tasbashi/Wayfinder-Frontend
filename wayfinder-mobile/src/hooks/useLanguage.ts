import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages, SupportedLanguage } from '@/i18n';

export function useLanguage() {
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language as SupportedLanguage;

    const setLanguage = useCallback(async (language: SupportedLanguage) => {
        await changeLanguage(language);
    }, []);

    const toggleLanguage = useCallback(async () => {
        const newLanguage = currentLanguage === 'en' ? 'tr' : 'en';
        await changeLanguage(newLanguage);
    }, [currentLanguage]);

    const getCurrentLanguageInfo = useCallback(() => {
        return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
    }, [currentLanguage]);

    return {
        currentLanguage,
        setLanguage,
        toggleLanguage,
        getCurrentLanguageInfo,
        supportedLanguages,
    };
}

export default useLanguage;
