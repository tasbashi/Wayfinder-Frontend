'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationService } from '../../../api/translation.service';
import {
    EntityType,
    CreateTranslationCommand,
    TRANSLATABLE_PROPERTIES,
    TRANSLATION_LANGUAGES,
    LanguageCode,
} from '../../../types/translation.types';

interface TranslationFormProps {
    entityType: EntityType;
    entityId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

/**
 * Form for creating new translations
 */
export function TranslationForm({
    entityType,
    entityId,
    onSuccess,
    onCancel,
}: TranslationFormProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateTranslationCommand>({
        entityType,
        entityId,
        propertyName: TRANSLATABLE_PROPERTIES[entityType][0] || 'Name',
        languageCode: 'tr',
        translatedValue: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.translatedValue.trim()) {
            setError(t('errors.required'));
            return;
        }

        setIsSubmitting(true);

        try {
            await TranslationService.create(formData);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Property Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t('translations.property')}
                </label>
                <select
                    value={formData.propertyName}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, propertyName: e.target.value }))
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {TRANSLATABLE_PROPERTIES[entityType].map((prop) => (
                        <option key={prop} value={prop}>
                            {t(`translations.properties.${prop.toLowerCase()}`, prop)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Language Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t('translations.language')}
                </label>
                <select
                    value={formData.languageCode}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            languageCode: e.target.value as LanguageCode,
                        }))
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {TRANSLATION_LANGUAGES.map(({ code, label }) => (
                        <option key={code} value={code}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Translated Value */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t('translations.value')}
                </label>
                <input
                    type="text"
                    value={formData.translatedValue}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, translatedValue: e.target.value }))
                    }
                    placeholder={t('translations.value')}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? t('common.loading') : t('common.save')}
                </button>
            </div>
        </form>
    );
}
