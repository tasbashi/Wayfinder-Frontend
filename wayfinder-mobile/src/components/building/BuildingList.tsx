/**
 * BuildingList Component
 * 
 * FlatList wrapper for displaying buildings with loading, error, and empty states.
 */

import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Building } from 'lucide-react-native';
import { theme } from '@/theme';
import { BuildingDto } from '@/api/types';
import { BuildingCard } from './BuildingCard';
import { EmptyState, ErrorState, LoadingSpinner } from '@/components/common';

interface BuildingListProps {
    /** Buildings to display */
    buildings: BuildingDto[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: string | null;
    /** Refresh callback */
    onRefresh?: () => void;
    /** Building press callback */
    onBuildingPress?: (building: BuildingDto) => void;
    /** Empty state title */
    emptyTitle?: string;
    /** Empty state description */
    emptyDescription?: string;
    /** Retry callback for error state */
    onRetry?: () => void;
}

export function BuildingList({
    buildings,
    isLoading = false,
    error = null,
    onRefresh,
    onBuildingPress,
    emptyTitle = 'No Buildings',
    emptyDescription = 'No buildings are available at this time.',
    onRetry,
}: BuildingListProps) {
    // Loading state
    if (isLoading && buildings.length === 0) {
        return <LoadingSpinner fullScreen message="Loading buildings..." />;
    }

    // Error state
    if (error && buildings.length === 0) {
        return (
            <ErrorState
                message="Failed to load buildings"
                description={error}
                onRetry={onRetry || onRefresh}
            />
        );
    }

    // Render building item
    const renderItem = ({ item }: { item: BuildingDto }) => (
        <BuildingCard
            building={item}
            onPress={onBuildingPress ? () => onBuildingPress(item) : undefined}
        />
    );

    // Empty component
    const ListEmptyComponent = () => (
        <EmptyState
            icon={<Building size={48} color={theme.colors.textTertiary} />}
            title={emptyTitle}
            description={emptyDescription}
        />
    );

    return (
        <FlatList
            data={buildings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            ListEmptyComponent={ListEmptyComponent}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary[500]}
                        colors={[theme.colors.primary[500]]}
                    />
                ) : undefined
            }
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
});
