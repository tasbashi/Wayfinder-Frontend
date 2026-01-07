/**
 * Building Detail Screen
 * 
 * Shows floors and nodes for a specific building.
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { useBuildingDetail } from '@/features/buildings';
import { useSearch } from '@/features/search';
import { useNavigationStore } from '@/features/navigation';
import { FloorDto, NodeDto } from '@/api/types';
import { FloorCard } from '@/components/building';
import { NodeList } from '@/components/node';
import { Header, LoadingSpinner, ErrorState, EmptyState, SearchInput } from '@/components/common';

export default function BuildingDetailScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();

    const {
        building,
        isLoading,
        error,
        refresh,
    } = useBuildingDetail({ buildingId: id || '' });

    // Search functionality for nodes within this building
    const {
        query,
        results: searchResults,
        isLoading: searchLoading,
        setQuery,
        clearSearch,
    } = useSearch({ buildingId: id });

    // Navigation store for setting end node
    const { setEndNode, setCurrentBuilding } = useNavigationStore();

    // Determine if searching
    const isSearching = query.length >= 2;

    // Handle back press
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // Handle floor press
    const handleFloorPress = useCallback(
        (floor: FloorDto) => {
            router.push(`/buildings/${id}/floor/${floor.id}`);
        },
        [router, id]
    );

    // Handle node press from search results
    const handleNodePress = useCallback(
        (node: NodeDto) => {
            // Set as end node and navigate to route selection
            setEndNode(node);

            // Set building context for filtering search on next screen
            setCurrentBuilding(id || null, node.floorId);

            router.push('/navigation/select-start');
        },
        [router, setEndNode, setCurrentBuilding, id]
    );

    // Handle search input change
    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
        },
        [setQuery]
    );

    // Loading state
    if (isLoading && !building) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="" showBack onBack={handleBack} />
                <LoadingSpinner fullScreen message={t('common.loading', 'Loading...')} />
            </SafeAreaView>
        );
    }

    // Error state
    if (error && !building) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="" showBack onBack={handleBack} />
                <ErrorState
                    message={t('buildings.loadError', 'Could not load building')}
                    description={error}
                    onRetry={refresh}
                />
            </SafeAreaView>
        );
    }

    if (!building) {
        return null;
    }

    const floors = building.floors || [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header title={building.name} showBack onBack={handleBack} />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <SearchInput
                    value={query}
                    onSearch={handleSearch}
                    placeholder={t('buildings.searchNodes', 'Search locations in this building...')}
                    isLoading={searchLoading}
                />
            </View>

            {/* Content */}
            {isSearching ? (
                // Show search results
                <NodeList
                    nodes={searchResults}
                    isLoading={searchLoading}
                    onNodePress={handleNodePress}
                    emptyTitle={t('buildings.noNodes', 'No locations found')}
                    emptyDescription={t(
                        'buildings.noNodesDesc',
                        'No locations match your search.'
                    )}
                />
            ) : (
                // Show floors list
                <FlatList
                    data={floors}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <FloorCard
                            floor={item}
                            onPress={() => handleFloorPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Layers size={48} color={theme.colors.textTertiary} />}
                            title={t('buildings.noFloors', 'No Floors')}
                            description={t('buildings.noFloorsDesc', 'This building has no floors yet.')}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    listContent: {
        flexGrow: 1,
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
});
