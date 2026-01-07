/**
 * Explore Screen
 * 
 * Unified exploration of buildings, floors, and locations.
 * Replaces the old Navigate tab with better UX.
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { useBuildings } from '@/features/buildings';
import { useSearch } from '@/features/search';
import { useNavigationStore } from '@/features/navigation';
import { BuildingList } from '@/components/building';
import { NodeList } from '@/components/node';
import { SearchInput, LargeHeader } from '@/components/common';
import { BuildingDto, NodeDto } from '@/api/types';

export default function ExploreScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    // Buildings data
    const { buildings, isLoading: buildingsLoading, error, refresh } = useBuildings();

    // Search functionality
    const {
        query,
        results: searchResults,
        isLoading: searchLoading,
        setQuery,
        clearSearch,
    } = useSearch();

    // Navigation store for setting start/end nodes
    const { setStartNode, setEndNode } = useNavigationStore();

    // Determine what to show
    const isSearching = query.length >= 2;

    // Handle building press
    const handleBuildingPress = useCallback(
        (building: BuildingDto) => {
            router.push(`/buildings/${building.id}`);
        },
        [router]
    );

    // Handle node press from search results
    const handleNodePress = useCallback(
        (node: NodeDto) => {
            // Set as end node and navigate to route selection
            setEndNode(node);
            router.push('/navigation/select-start');
        },
        [router, setEndNode]
    );

    // Handle search input change
    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
        },
        [setQuery]
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LargeHeader
                title={t('explore.title', 'Explore')}
                subtitle={t('explore.subtitle', 'Find your destination')}
            />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <SearchInput
                    value={query}
                    onSearch={handleSearch}
                    placeholder={t('explore.searchPlaceholder', 'Search locations...')}
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
                    emptyTitle={t('explore.noResults', 'No Results')}
                    emptyDescription={t(
                        'explore.noResultsDesc',
                        'No locations found matching your search.'
                    )}
                />
            ) : (
                // Show buildings list
                <BuildingList
                    buildings={buildings?.items || []}
                    isLoading={buildingsLoading}
                    error={error}
                    onRefresh={refresh}
                    onBuildingPress={handleBuildingPress}
                    emptyTitle={t('explore.noBuildings', 'No Buildings')}
                    emptyDescription={t(
                        'explore.noBuildingsDesc',
                        'No buildings are available yet.'
                    )}
                />
            )}
        </View>
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
});
