/**
 * NodeList Component
 * 
 * FlatList wrapper for displaying nodes with loading, error, and empty states.
 */

import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { theme } from '@/theme';
import { NodeDto } from '@/api/types';
import { NodeCard } from './NodeCard';
import { EmptyState, ErrorState, LoadingSpinner } from '@/components/common';

interface NodeListProps {
    /** Nodes to display */
    nodes: NodeDto[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: string | null;
    /** Refresh callback */
    onRefresh?: () => void;
    /** Node press callback */
    onNodePress?: (node: NodeDto) => void;
    /** Empty state title */
    emptyTitle?: string;
    /** Empty state description */
    emptyDescription?: string;
    /** Retry callback for error state */
    onRetry?: () => void;
    /** Show type badges */
    showTypeBadges?: boolean;
    /** Compact mode */
    compact?: boolean;
}

export function NodeList({
    nodes,
    isLoading = false,
    error = null,
    onRefresh,
    onNodePress,
    emptyTitle = 'No Locations',
    emptyDescription = 'No locations found.',
    onRetry,
    showTypeBadges = true,
    compact = false,
}: NodeListProps) {
    // Loading state
    if (isLoading && nodes.length === 0) {
        return <LoadingSpinner fullScreen message="Loading locations..." />;
    }

    // Error state
    if (error && nodes.length === 0) {
        return (
            <ErrorState
                message="Failed to load locations"
                description={error}
                onRetry={onRetry || onRefresh}
            />
        );
    }

    // Render node item
    const renderItem = ({ item }: { item: NodeDto }) => (
        <NodeCard
            node={item}
            onPress={onNodePress ? () => onNodePress(item) : undefined}
            showTypeBadge={showTypeBadges}
            compact={compact}
        />
    );

    // Empty component
    const ListEmptyComponent = () => (
        <EmptyState
            icon={<MapPin size={48} color={theme.colors.textTertiary} />}
            title={emptyTitle}
            description={emptyDescription}
        />
    );

    return (
        <FlatList
            data={nodes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.content, compact && styles.contentCompact]}
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
    contentCompact: {
        padding: theme.spacing.sm,
        paddingBottom: theme.spacing.lg,
    },
});
