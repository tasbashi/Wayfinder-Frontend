/**
 * Translation types for managing localized content
 */

export type EntityType = 'Building' | 'Floor' | 'Node';
export type LanguageCode = 'en' | 'tr';

export interface TranslationDto {
    id: string;
    entityType: EntityType;
    entityId: string;
    propertyName: string;
    languageCode: LanguageCode;
    translatedValue: string;
    createdDate: string;
}

export interface CreateTranslationCommand {
    entityType: EntityType;
    entityId: string;
    propertyName: string;
    languageCode: LanguageCode;
    translatedValue: string;
}

export interface UpdateTranslationCommand {
    id: string;
    translatedValue: string;
}

/**
 * Translatable properties for each entity type
 */
export const TRANSLATABLE_PROPERTIES: Record<EntityType, string[]> = {
    Building: ['Name', 'Address'],
    Floor: ['Name'],
    Node: ['Name'],
};

/**
 * Supported languages for translations
 */
export const TRANSLATION_LANGUAGES: { code: LanguageCode; label: string }[] = [
    { code: 'tr', label: 'Türkçe' },
];
