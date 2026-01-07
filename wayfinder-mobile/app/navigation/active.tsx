/**
 * Active Navigation Screen
 * 
 * Full-screen turn-by-turn navigation experience with:
 * - Zoomable floor plan with route overlay
 * - Auto-zoom to current step
 * - Navigation instructions bottom sheet
 * - Floating map controls
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, useColorScheme, BackHandler, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '@/features/navigation';
import { floorsApi } from '@/api';
import { FloorDto } from '@/api/types';
import { theme } from '@/theme';
import {
    FloorPlanViewer,
    NavigationHeader,
    FloatingMapControls,
    NavigationBottomSheet,
} from '@/components/navigation';
import { LoadingSpinner } from '@/components/common';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ActiveNavigationScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Navigation store
    const {
        route,
        currentStepIndex,
        startNode,
        endNode,
        goToStep,
        nextStep,
        previousStep,
        reset,
    } = useNavigationStore();

    // Local state
    const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [currentFloorPlan, setCurrentFloorPlan] = useState<FloorDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Floor plan image dimensions
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

    // Check if we have valid route data
    const hasValidRoute = route && route.path && route.path.length > 0;

    // Get current and next route nodes
    const currentNode = useMemo(() => {
        if (!hasValidRoute) return null;
        return route.path[Math.min(currentStepIndex, route.path.length - 1)];
    }, [route, currentStepIndex, hasValidRoute]);

    const nextNode = useMemo(() => {
        if (!hasValidRoute || currentStepIndex >= route.path.length - 1) return null;
        return route.path[currentStepIndex + 1];
    }, [route, currentStepIndex, hasValidRoute]);

    // Calculate remaining stats
    const remainingStats = useMemo(() => {
        if (!hasValidRoute) {
            return { distance: 0, time: 0, distanceToNext: 0 };
        }

        let remainingDistance = 0;
        let distanceToNext = 0;

        for (let i = currentStepIndex; i < route.path.length; i++) {
            remainingDistance += route.path[i].distanceFromPrevious;
            if (i === currentStepIndex + 1) {
                distanceToNext = route.path[i].distanceFromPrevious;
            }
        }

        // Estimate time based on walking speed (1.4 m/s)
        const remainingTime = Math.round(remainingDistance / 1.4);

        return { distance: remainingDistance, time: remainingTime, distanceToNext };
    }, [route, currentStepIndex, hasValidRoute]);

    // Redirect if no route - use effect to avoid setState during render
    useEffect(() => {
        if (!hasValidRoute) {
            setShouldRedirect(true);
        }
    }, [hasValidRoute]);

    useEffect(() => {
        if (shouldRedirect) {
            router.replace('/navigation/result');
        }
    }, [shouldRedirect, router]);

    // Load floor plan for current node
    useEffect(() => {
        const loadFloorPlan = async () => {
            if (!currentNode) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const floor = await floorsApi.getById(currentNode.floorId);
                setCurrentFloorPlan(floor);

                // Get actual image dimensions
                if (floor.floorPlanImageUrl) {
                    Image.getSize(
                        floor.floorPlanImageUrl,
                        (width, height) => {
                            console.log('[ActiveNavigation] Image dimensions:', width, height);
                            setImageDimensions({ width, height });
                            setIsLoading(false);
                        },
                        (error) => {
                            console.error('[ActiveNavigation] Failed to get image size:', error);
                            // Fallback to default dimensions
                            setImageDimensions({ width: 800, height: 600 });
                            setIsLoading(false);
                        }
                    );
                } else {
                    setImageDimensions({ width: 800, height: 600 });
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('[ActiveNavigation] Failed to load floor plan:', error);
                setIsLoading(false);
            }
        };

        loadFloorPlan();
    }, [currentNode?.floorId]);

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleEndRoute();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    // User interaction handler (disables auto-zoom temporarily)
    const handleUserInteraction = useCallback(() => {
        setAutoZoomEnabled(false);
    }, []);

    // Recenter and re-enable auto-zoom
    const handleRecenter = useCallback(() => {
        setAutoZoomEnabled(true);
    }, []);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        handleUserInteraction();
    }, [handleUserInteraction]);

    const handleZoomOut = useCallback(() => {
        handleUserInteraction();
    }, [handleUserInteraction]);

    // Audio toggle
    const handleToggleAudio = useCallback(() => {
        setAudioEnabled((prev) => !prev);
    }, []);

    // Skip to next step
    const handleNextStepPress = useCallback(() => {
        nextStep();
        setAutoZoomEnabled(true);
    }, [nextStep]);

    // End navigation - use setTimeout to avoid setState during render
    const handleEndRoute = useCallback(() => {
        setTimeout(() => {
            reset();
            router.replace('/');
        }, 0);
    }, [reset, router]);

    // Close navigation
    const handleClose = useCallback(() => {
        handleEndRoute();
    }, [handleEndRoute]);

    // Show loading while checking route or loading image dimensions
    if (shouldRedirect || !hasValidRoute || !currentNode || isLoading || !imageDimensions) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#101322' : theme.colors.background }]}>
                <LoadingSpinner fullScreen message={t('common.loading', 'Loading...')} />
            </View>
        );
    }

    // Get floor name for header
    const floorName = currentNode.floorName || t('navigation.floor', 'Floor');
    const sectionName = startNode?.name
        ? `${t('navigation.to', 'To')} ${endNode?.name || ''}`
        : undefined;

    // Use actual floor plan image dimensions
    const planWidth = imageDimensions.width;
    const planHeight = imageDimensions.height;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: isDark ? '#101322' : theme.colors.background },
            ]}
        >
            {/* Floor Plan Viewer */}
            <FloorPlanViewer
                floorPlanUrl={currentFloorPlan?.floorPlanImageUrl}
                routeNodes={route.path}
                currentStepIndex={currentStepIndex}
                planWidth={planWidth}
                planHeight={planHeight}
                autoZoomEnabled={autoZoomEnabled}
                onUserInteraction={handleUserInteraction}
                currentFloorId={currentNode?.floorId}
            />

            {/* Header Overlay */}
            <NavigationHeader
                floorName={floorName}
                sectionName={sectionName}
                onClose={handleClose}
            />

            {/* Floating Map Controls */}
            <FloatingMapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onRecenter={handleRecenter}
                onToggleAudio={handleToggleAudio}
                audioEnabled={audioEnabled}
            />

            {/* Bottom Sheet */}
            <NavigationBottomSheet
                currentNode={currentNode}
                nextNode={nextNode || undefined}
                currentStepIndex={currentStepIndex}
                totalSteps={route.path.length}
                remainingTimeSeconds={remainingStats.time}
                remainingDistance={remainingStats.distance}
                distanceToNext={remainingStats.distanceToNext}
                onNextStepPress={handleNextStepPress}
                onEndRoute={handleEndRoute}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
