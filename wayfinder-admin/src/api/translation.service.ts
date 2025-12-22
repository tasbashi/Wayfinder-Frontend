import { apiClient } from './client';
import { ServiceResponse } from '../types/api.types';
import {
    TranslationDto,
    CreateTranslationCommand,
    UpdateTranslationCommand,
    EntityType,
} from '../types/translation.types';

/**
 * Service for managing entity translations (Admin only)
 */
export class TranslationService {
    /**
     * Get all translations for an entity
     */
    static async getByEntity(
        entityType: EntityType,
        entityId: string
    ): Promise<TranslationDto[]> {
        const response = await apiClient.get<ServiceResponse<TranslationDto[]>>(
            `/api/translations/${entityType}/${entityId}`
        );

        if (response.data.isSuccess && response.data.data) {
            return response.data.data;
        }

        throw new Error(
            response.data.errorMessage || 'Failed to fetch translations'
        );
    }

    /**
     * Create a new translation
     */
    static async create(data: CreateTranslationCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            '/api/translations',
            data
        );

        if (response.data.isSuccess && response.data.data) {
            return response.data.data;
        }

        throw new Error(
            response.data.errorMessage || 'Failed to create translation'
        );
    }

    /**
     * Update an existing translation
     */
    static async update(
        id: string,
        data: UpdateTranslationCommand
    ): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `/api/translations/${id}`,
            data
        );

        if (!response.data.isSuccess) {
            throw new Error(
                response.data.errorMessage || 'Failed to update translation'
            );
        }
    }

    /**
     * Delete a translation
     */
    static async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `/api/translations/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(
                response.data.errorMessage || 'Failed to delete translation'
            );
        }
    }
}
