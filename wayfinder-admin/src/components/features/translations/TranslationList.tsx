'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { TranslationService } from '../../../api/translation.service';
import {
    TranslationDto,
    EntityType,
    TRANSLATION_LANGUAGES,
} from '../../../types/translation.types';

interface TranslationListProps {
    entityType: EntityType;
    entityId: string;
    onRefresh: () => void;
}

/**
 * List of translations for an entity with edit/delete functionality
 */
export function TranslationList({ entityType, entityId, onRefresh }: TranslationListProps) {
    const { t } = useTranslation();
    const [translations, setTranslations] = useState<TranslationDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadTranslations();
    }, [entityType, entityId]);

    const loadTranslations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await TranslationService.getByEntity(entityType, entityId);
            setTranslations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (translation: TranslationDto) => {
        setEditingId(translation.id);
        setEditValue(translation.translatedValue);
    };

    const handleSaveEdit = async (id: string) => {
        try {
            await TranslationService.update(id, { id, translatedValue: editValue });
            setEditingId(null);
            onRefresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error'));
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('common.confirm'))) return;

        try {
            await TranslationService.delete(id);
            onRefresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error'));
        }
    };

    const getLanguageLabel = (code: string) => {
        const lang = TRANSLATION_LANGUAGES.find((l) => l.code === code);
        return lang?.label || code;
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">{t('common.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/30 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (translations.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">{t('translations.noTranslations')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                            {t('translations.property')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                            {t('translations.language')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                            {t('translations.value')}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                            {t('common.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {translations.map((translation) => (
                        <tr key={translation.id} className="hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-white">
                                {t(`translations.properties.${translation.propertyName.toLowerCase()}`, translation.propertyName)}
                            </td>
                            <td className="px-4 py-3 text-white">
                                {getLanguageLabel(translation.languageCode)}
                            </td>
                            <td className="px-4 py-3 text-white">
                                {editingId === translation.id ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                ) : (
                                    translation.translatedValue
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    {editingId === translation.id ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveEdit(translation.id)}
                                                className="p-1.5 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded"
                                                title={t('common.save')}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded"
                                                title={t('common.cancel')}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(translation)}
                                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded"
                                                title={t('common.edit')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(translation.id)}
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
