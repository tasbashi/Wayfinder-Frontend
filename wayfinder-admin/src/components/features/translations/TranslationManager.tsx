'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Building2, Layers, MapPin } from 'lucide-react';
import { TranslationList } from './TranslationList';
import { TranslationForm } from './TranslationForm';
import { EntityType } from '../../../types/translation.types';
import { BuildingDto } from '../../../types/building.types';
import { FloorDto } from '../../../types/floor.types';
import { NodeDto } from '../../../types/node.types';
import { useBuildingStore } from '../../../store/buildingStore';

interface EntityInfo {
    id: string;
    name: string;
    type: EntityType;
}

/**
 * Main Translation Management component
 * Allows admins to manage translations for buildings, floors, and nodes
 */
export function TranslationManager() {
    const { t } = useTranslation();
    const { buildings, isLoading: buildingsLoading } = useBuildingStore();

    const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('Building');
    const [selectedEntity, setSelectedEntity] = useState<EntityInfo | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Get entities based on selected type
    const getEntities = (): EntityInfo[] => {
        const buildingItems = buildings?.items || [];

        switch (selectedEntityType) {
            case 'Building':
                return buildingItems.map((b: BuildingDto) => ({
                    id: b.id,
                    name: b.name,
                    type: 'Building' as EntityType,
                }));
            case 'Floor':
                return buildingItems.flatMap((b: BuildingDto) =>
                    (b.floors || []).map((f: FloorDto) => ({
                        id: f.id,
                        name: `${b.name} - ${f.name}`,
                        type: 'Floor' as EntityType,
                    }))
                );
            case 'Node':
                // Note: Nodes should be loaded separately or from floors
                // For now, return empty - can be enhanced later
                return [];
            default:
                return [];
        }
    };

    const handleEntityTypeChange = (type: EntityType) => {
        setSelectedEntityType(type);
        setSelectedEntity(null);
    };

    const handleTranslationAdded = () => {
        setShowForm(false);
        setRefreshKey((prev) => prev + 1);
    };

    const entityTypes: { type: EntityType; icon: React.ReactNode; label: string }[] = [
        { type: 'Building', icon: <Building2 className="w-4 h-4" />, label: t('translations.entityTypes.building') },
        { type: 'Floor', icon: <Layers className="w-4 h-4" />, label: t('translations.entityTypes.floor') },
        { type: 'Node', icon: <MapPin className="w-4 h-4" />, label: t('translations.entityTypes.node') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Languages className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('translations.title')}</h1>
                        <p className="text-gray-400 text-sm">{t('translations.description')}</p>
                    </div>
                </div>
            </div>

            {/* Entity Type Selector */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-400 mb-3">{t('translations.entityType')}</h2>
                <div className="flex gap-2">
                    {entityTypes.map(({ type, icon, label }) => (
                        <button
                            key={type}
                            onClick={() => handleEntityTypeChange(type)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${selectedEntityType === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Entity Selector */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-400 mb-3">
                    {t('translations.selectEntity')}
                </h2>
                {buildingsLoading ? (
                    <div className="text-gray-400">{t('common.loading')}</div>
                ) : (
                    <select
                        value={selectedEntity?.id || ''}
                        onChange={(e) => {
                            const entity = getEntities().find((ent) => ent.id === e.target.value);
                            setSelectedEntity(entity || null);
                        }}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{t('translations.selectEntity')}</option>
                        {getEntities().map((entity) => (
                            <option key={entity.id} value={entity.id}>
                                {entity.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Translation Content */}
            {selectedEntity ? (
                <div className="space-y-4">
                    {/* Add Translation Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 transition-colors"
                        >
                            {t('translations.add')}
                        </button>
                    </div>

                    {/* Translation Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    {t('translations.add')}
                                </h2>
                                <TranslationForm
                                    entityType={selectedEntity.type}
                                    entityId={selectedEntity.id}
                                    onSuccess={handleTranslationAdded}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Translation List */}
                    <TranslationList
                        key={refreshKey}
                        entityType={selectedEntity.type}
                        entityId={selectedEntity.id}
                        onRefresh={() => setRefreshKey((prev) => prev + 1)}
                    />
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <Languages className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{t('translations.selectEntity')}</p>
                </div>
            )}
        </div>
    );
}
