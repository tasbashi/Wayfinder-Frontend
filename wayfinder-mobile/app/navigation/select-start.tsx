/**
 * Select Start Location Screen
 * 
 * First step of navigation flow - select starting point.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { useNavigationStore } from '@/features/navigation';
import { NodeDto } from '@/api/types';
import { LocationSelector } from '@/components/navigation';
import { Header } from '@/components/common';

export default function SelectStartScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { endNode, setStartNode, currentBuildingId, currentFloorId } = useNavigationStore();

    // Handle location selection
    const handleSelect = useCallback(
        (node: NodeDto) => {
            setStartNode(node);
            // If end node already selected, go to route result
            if (endNode) {
                router.push('/navigation/result');
            } else {
                router.push('/navigation/select-end');
            }
        },
        [setStartNode, endNode, router]
    );

    // Handle back press
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                title={t('navigation.startLocation', 'Starting Point')}
                showBack
                onBack={handleBack}
            />

            {/* Location selector */}
            <LocationSelector
                type="start"
                onSelect={handleSelect}
                buildingId={currentBuildingId || undefined}
                excludeNodeId={endNode?.id}
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
