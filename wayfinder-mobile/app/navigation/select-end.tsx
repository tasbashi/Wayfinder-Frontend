/**
 * Select End Location Screen
 * 
 * Second step of navigation flow - select destination.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { useNavigationStore } from '@/features/navigation';
import { NodeDto } from '@/api/types';
import { LocationSelector } from '@/components/navigation';
import { Header } from '@/components/common';

export default function SelectEndScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { startNode, setEndNode, currentBuildingId, currentFloorId } = useNavigationStore();

    // Handle location selection
    const handleSelect = useCallback(
        (node: NodeDto) => {
            setEndNode(node);
            router.push('/navigation/result');
        },
        [setEndNode, router]
    );

    // Handle back press
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                title={t('navigation.destination', 'Destination')}
                showBack
                onBack={handleBack}
            />

            {/* Location selector */}
            <LocationSelector
                type="end"
                onSelect={handleSelect}
                buildingId={currentBuildingId || undefined}
                floorId={currentFloorId || undefined}
                excludeNodeId={startNode?.id}
                showScanQR
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
