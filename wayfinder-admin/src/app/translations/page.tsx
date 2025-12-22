'use client';

import { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useBuildingStore } from '@/store/buildingStore';
import { NodeService } from '@/api/node.service';
import { TranslationService } from '@/api/translation.service';
import {
    Languages,
    Building2,
    Layers,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Search,
    Filter,
    ChevronDown
} from 'lucide-react';
import {
    TranslationDto,
    EntityType,
    CreateTranslationCommand,
    TRANSLATABLE_PROPERTIES,
    TRANSLATION_LANGUAGES,
    LanguageCode
} from '@/types/translation.types';
import { BuildingDto } from '@/types/building.types';
import { FloorDto } from '@/types/floor.types';
import { NodeDto } from '@/types/node.types';

interface EntityInfo {
    id: string;
    name: string;
    type: EntityType;
    parentInfo?: string; // For context (e.g., building name for floors)
}

function TranslationsContent() {
    const { buildings, isLoading: buildingsLoading, error: buildingsError, fetchBuildings, clearError } = useBuildingStore();

    const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('Building');
    const [selectedEntity, setSelectedEntity] = useState<EntityInfo | null>(null);
    const [translations, setTranslations] = useState<TranslationDto[]>([]);
    const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);

    // Filter states
    const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('');
    const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Node loading states
    const [floorNodes, setFloorNodes] = useState<NodeDto[]>([]);
    const [isLoadingNodes, setIsLoadingNodes] = useState(false);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CreateTranslationCommand>({
        entityType: 'Building',
        entityId: '',
        propertyName: 'Name',
        languageCode: 'tr',
        translatedValue: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetchBuildings(1, 100); // Load all buildings
    }, [fetchBuildings]);

    // Load nodes when floor filter changes
    useEffect(() => {
        if (selectedEntityType === 'Node' && selectedFloorFilter) {
            loadNodesForFloor(selectedFloorFilter);
        } else {
            setFloorNodes([]);
        }
    }, [selectedFloorFilter, selectedEntityType]);

    // Reset floor filter when building filter changes
    useEffect(() => {
        setSelectedFloorFilter('');
        setFloorNodes([]);
    }, [selectedBuildingFilter]);

    const loadNodesForFloor = async (floorId: string) => {
        setIsLoadingNodes(true);
        try {
            const nodes = await NodeService.getByFloor(floorId);
            setFloorNodes(nodes);
        } catch (error) {
            console.error('Failed to load nodes:', error);
            setFloorNodes([]);
        } finally {
            setIsLoadingNodes(false);
        }
    };

    // Get available buildings for filter dropdown
    const availableBuildings = useMemo(() => {
        return buildings?.items || [];
    }, [buildings]);

    // Get available floors for filter dropdown (filtered by selected building)
    const availableFloors = useMemo(() => {
        if (!selectedBuildingFilter) return [];
        const building = availableBuildings.find(b => b.id === selectedBuildingFilter);
        return building?.floors || [];
    }, [availableBuildings, selectedBuildingFilter]);

    // Get the selected floor name for display
    const getFloorName = (floorId: string) => {
        for (const building of availableBuildings) {
            const floor = building.floors?.find((f: FloorDto) => f.id === floorId);
            if (floor) return `${building.name} - ${floor.name}`;
        }
        return '';
    };

    // Get entities based on selected type with filtering
    const getEntities = (): EntityInfo[] => {
        const buildingItems = buildings?.items || [];
        const searchLower = searchTerm.toLowerCase();

        switch (selectedEntityType) {
            case 'Building':
                return buildingItems
                    .filter((b: BuildingDto) =>
                        !searchTerm || b.name.toLowerCase().includes(searchLower)
                    )
                    .map((b: BuildingDto) => ({
                        id: b.id,
                        name: b.name,
                        type: 'Building' as EntityType,
                    }));

            case 'Floor':
                let floors: EntityInfo[] = [];
                if (selectedBuildingFilter) {
                    const building = buildingItems.find((b: BuildingDto) => b.id === selectedBuildingFilter);
                    if (building) {
                        floors = (building.floors || []).map((f: FloorDto) => ({
                            id: f.id,
                            name: f.name,
                            type: 'Floor' as EntityType,
                            parentInfo: building.name,
                        }));
                    }
                } else {
                    floors = buildingItems.flatMap((b: BuildingDto) =>
                        (b.floors || []).map((f: FloorDto) => ({
                            id: f.id,
                            name: f.name,
                            type: 'Floor' as EntityType,
                            parentInfo: b.name,
                        }))
                    );
                }
                return floors.filter(f =>
                    !searchTerm || f.name.toLowerCase().includes(searchLower) ||
                    f.parentInfo?.toLowerCase().includes(searchLower)
                );

            case 'Node':
                return floorNodes
                    .filter(n =>
                        !searchTerm || (n.name && n.name.toLowerCase().includes(searchLower))
                    )
                    .map((n) => ({
                        id: n.id,
                        name: n.name || `Unnamed Node`,
                        type: 'Node' as EntityType,
                        parentInfo: getFloorName(n.floorId),
                    }));

            default:
                return [];
        }
    };

    const loadTranslations = async (entityType: EntityType, entityId: string) => {
        setIsLoadingTranslations(true);
        setTranslationError(null);
        try {
            const data = await TranslationService.getByEntity(entityType, entityId);
            setTranslations(data);
        } catch (err) {
            setTranslationError(err instanceof Error ? err.message : 'Failed to load translations');
            setTranslations([]);
        } finally {
            setIsLoadingTranslations(false);
        }
    };

    const handleEntityTypeChange = (type: EntityType) => {
        setSelectedEntityType(type);
        setSelectedEntity(null);
        setTranslations([]);
        setSearchTerm('');
        // Reset filters
        if (type === 'Building') {
            setSelectedBuildingFilter('');
            setSelectedFloorFilter('');
        }
    };

    const handleEntitySelect = (entityId: string) => {
        const entity = getEntities().find((e) => e.id === entityId);
        if (entity) {
            setSelectedEntity(entity);
            loadTranslations(entity.type, entity.id);
            setFormData(prev => ({
                ...prev,
                entityType: entity.type,
                entityId: entity.id,
                propertyName: TRANSLATABLE_PROPERTIES[entity.type][0]
            }));
        } else {
            setSelectedEntity(null);
            setTranslations([]);
        }
    };

    const handleCreateTranslation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.translatedValue.trim() || !selectedEntity) return;

        setIsSubmitting(true);
        try {
            await TranslationService.create(formData);
            setShowForm(false);
            setFormData(prev => ({ ...prev, translatedValue: '' }));
            loadTranslations(selectedEntity.type, selectedEntity.id);
        } catch (err) {
            setTranslationError(err instanceof Error ? err.message : 'Failed to create translation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveEdit = async (id: string) => {
        try {
            await TranslationService.update(id, { id, translatedValue: editValue });
            setEditingId(null);
            if (selectedEntity) {
                loadTranslations(selectedEntity.type, selectedEntity.id);
            }
        } catch (err) {
            setTranslationError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this translation?')) return;
        try {
            await TranslationService.delete(id);
            if (selectedEntity) {
                loadTranslations(selectedEntity.type, selectedEntity.id);
            }
        } catch (err) {
            setTranslationError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const entityTypes: { type: EntityType; icon: React.ReactNode; label: string }[] = [
        { type: 'Building', icon: <Building2 className="w-4 h-4" />, label: 'Buildings' },
        { type: 'Floor', icon: <Layers className="w-4 h-4" />, label: 'Floors' },
        { type: 'Node', icon: <MapPin className="w-4 h-4" />, label: 'Nodes' },
    ];

    const entities = getEntities();
    const showBuildingFilter = selectedEntityType === 'Floor' || selectedEntityType === 'Node';
    const showFloorFilter = selectedEntityType === 'Node';

    return (
        <Layout>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Languages className="w-8 h-8 text-blue-600" />
                            Translation Management
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            Manage translations for buildings, floors, and nodes
                        </p>
                    </div>
                </div>

                {/* Error Messages */}
                {buildingsError && (
                    <ErrorMessage message={buildingsError} onClose={clearError} variant="default" />
                )}
                {translationError && (
                    <ErrorMessage
                        message={translationError}
                        onClose={() => setTranslationError(null)}
                        variant="default"
                    />
                )}

                {/* Entity Type Tabs */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-medium text-gray-500 mb-3">Select Entity Type</h2>
                    <div className="flex flex-wrap gap-2">
                        {entityTypes.map(({ type, icon, label }) => (
                            <button
                                key={type}
                                onClick={() => handleEntityTypeChange(type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${selectedEntityType === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {icon}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Section */}
                {(showBuildingFilter || showFloorFilter) && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <h2 className="text-sm font-medium text-gray-500">Filters</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {/* Building Filter */}
                            {showBuildingFilter && (
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Building
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedBuildingFilter}
                                            onChange={(e) => setSelectedBuildingFilter(e.target.value)}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                     appearance-none bg-white"
                                        >
                                            <option value="">All Buildings</option>
                                            {availableBuildings.map((b: BuildingDto) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Floor Filter - Only for Nodes */}
                            {showFloorFilter && (
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Floor
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedFloorFilter}
                                            onChange={(e) => setSelectedFloorFilter(e.target.value)}
                                            disabled={!selectedBuildingFilter}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                     appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {selectedBuildingFilter ? 'Select a Floor' : 'Select Building First'}
                                            </option>
                                            {availableFloors.map((f: FloorDto) => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message for Node selection */}
                        {selectedEntityType === 'Node' && !selectedFloorFilter && (
                            <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Please select a building and floor to view nodes
                            </p>
                        )}
                    </div>
                )}

                {/* Search and Entity Selector */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Search {selectedEntityType}s
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`Search by name...`}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Entity Selector */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Select {selectedEntityType}
                            </label>
                            {buildingsLoading || isLoadingNodes ? (
                                <LoadingSpinner size="sm" text="Loading..." />
                            ) : selectedEntityType === 'Node' && !selectedFloorFilter ? (
                                <p className="text-gray-400 py-2">Select a floor first</p>
                            ) : entities.length === 0 ? (
                                <p className="text-gray-500 py-2">
                                    No {selectedEntityType.toLowerCase()}s found
                                    {searchTerm && ' matching your search'}
                                </p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedEntity?.id || ''}
                                        onChange={(e) => handleEntitySelect(e.target.value)}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg 
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                 appearance-none bg-white"
                                    >
                                        <option value="">-- Select a {selectedEntityType.toLowerCase()} --</option>
                                        {entities.map((entity) => (
                                            <option key={entity.id} value={entity.id}>
                                                {entity.parentInfo ? `${entity.parentInfo} > ${entity.name}` : entity.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            )}
                            {entities.length > 0 && (
                                <p className="mt-1 text-xs text-gray-400">
                                    Showing {entities.length} {selectedEntityType.toLowerCase()}(s)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Translations Section */}
                {selectedEntity && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Translations for: {selectedEntity.name}
                                </h2>
                                {selectedEntity.parentInfo && (
                                    <p className="text-sm text-gray-500">{selectedEntity.parentInfo}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                           hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Translation
                            </button>
                        </div>

                        {/* Add Translation Form */}
                        {showForm && (
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <form onSubmit={handleCreateTranslation} className="flex flex-wrap gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                                        <select
                                            value={formData.propertyName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {TRANSLATABLE_PROPERTIES[selectedEntity.type].map((prop) => (
                                                <option key={prop} value={prop}>{prop}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                        <select
                                            value={formData.languageCode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, languageCode: e.target.value as LanguageCode }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {TRANSLATION_LANGUAGES.map(({ code, label }) => (
                                                <option key={code} value={code}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Translated Value</label>
                                        <input
                                            type="text"
                                            value={formData.translatedValue}
                                            onChange={(e) => setFormData(prev => ({ ...prev, translatedValue: e.target.value }))}
                                            placeholder="Enter translation..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                 disabled:opacity-50 transition-colors"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Translations List */}
                        <div className="p-4">
                            {isLoadingTranslations ? (
                                <LoadingSpinner size="sm" text="Loading translations..." />
                            ) : translations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Languages className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No translations yet for this entity.</p>
                                    <p className="text-sm">Click "Add Translation" to create one.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Property</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Language</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Translated Value</th>
                                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {translations.map((t) => (
                                            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-2 text-gray-900">{t.propertyName}</td>
                                                <td className="py-3 px-2 text-gray-900">
                                                    {TRANSLATION_LANGUAGES.find(l => l.code === t.languageCode)?.label || t.languageCode}
                                                </td>
                                                <td className="py-3 px-2 text-gray-900">
                                                    {editingId === t.id ? (
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        t.translatedValue
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    {editingId === t.id ? (
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => handleSaveEdit(t.id)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(t.id);
                                                                    setEditValue(t.translatedValue);
                                                                }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(t.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State when no entity selected */}
                {!selectedEntity && !buildingsLoading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Languages className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Entity</h3>
                        <p className="text-gray-500">
                            {selectedEntityType === 'Node' && !selectedFloorFilter
                                ? 'Select a building and floor first, then choose a node to manage its translations.'
                                : 'Choose an entity from the dropdown above to manage its translations.'}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default function TranslationsPage() {
    return (
        <ProtectedRoute>
            <TranslationsContent />
        </ProtectedRoute>
    );
}
