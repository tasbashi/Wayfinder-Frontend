/**
 * Floor Detail Screen
 * 
 * Shows nodes on a specific floor.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { floorsApi, nodesApi } from '@/api';
import { FloorDto, NodeDto } from '@/api/types';
import { useNavigationStore } from '@/features/navigation';
import { NodeList } from '@/components/node';
import { Header, LoadingSpinner, ErrorState } from '@/components/common';

export default function FloorDetailScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id, floorId } = useLocalSearchParams<{ id: string; floorId: string }>();

    const [floor, setFloor] = useState<FloorDto | null>(null);
    const [nodes, setNodes] = useState<NodeDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { setEndNode, setCurrentBuilding } = useNavigationStore();

    // Fetch floor and nodes
    const fetchData = useCallback(async () => {
        if (!floorId) return;

        try {
            setIsLoading(true);
            setError(null);

            const [floorData, nodesData] = await Promise.all([
                floorsApi.getById(floorId),
                nodesApi.getByFloor(floorId),
            ]);

            setFloor(floorData);
            setNodes(nodesData);
        } catch (err) {
            console.error('[FloorDetail] Fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load floor');
        } finally {
            setIsLoading(false);
        }
    }, [floorId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle back press
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // Handle node press - set as destination and navigate
    // Also set building context so search is filtered to this building
    const handleNodePress = useCallback(
        (node: NodeDto) => {
            setEndNode(node);
            // Set building context for filtering search
            if (id) {
                setCurrentBuilding(id, floorId);
            }
            router.push('/navigation/select-start');
        },
        [setEndNode, setCurrentBuilding, id, floorId, router]
    );

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="" showBack onBack={handleBack} />
                <LoadingSpinner fullScreen message={t('common.loading', 'Loading...')} />
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header title="" showBack onBack={handleBack} />
                <ErrorState
                    message={t('floors.loadError', 'Could not load floor')}
                    description={error}
                    onRetry={fetchData}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                title={floor?.name || t('floors.floor', 'Floor')}
                showBack
                onBack={handleBack}
            />

            {/* Nodes list */}
            <NodeList
                nodes={nodes}
                onNodePress={handleNodePress}
                emptyTitle={t('floors.noNodes', 'No Locations')}
                emptyDescription={t('floors.noNodesDesc', 'This floor has no locations yet.')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});
