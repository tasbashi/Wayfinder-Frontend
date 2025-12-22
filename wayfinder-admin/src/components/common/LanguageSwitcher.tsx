'use client';

import { Globe } from 'lucide-react';
import { useLocale } from '../../store/localeStore';
import { useTranslation } from 'react-i18next';

/**
 * Language switcher dropdown component
 * Allows users to switch between supported languages
 */
export function LanguageSwitcher() {
    const { language, supportedLanguages, setLanguage, getLanguageLabel, isChangingLanguage } =
        useLocale();
    const { t } = useTranslation();

    return (
        <div className="relative inline-flex items-center">
            <Globe className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
                disabled={isChangingLanguage}
                className="appearance-none bg-gray-700 text-white text-sm pl-9 pr-8 py-2 rounded-lg
                   border border-gray-600 hover:border-gray-500 focus:outline-none
                   focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50
                   disabled:cursor-not-allowed transition-colors"
                aria-label={t('language.select')}
            >
                {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                        {getLanguageLabel(lang)}
                    </option>
                ))}
            </select>
            <svg
                className="absolute right-2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );
}
