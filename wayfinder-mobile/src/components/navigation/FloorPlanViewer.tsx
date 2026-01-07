/**
 * FloorPlanViewer
 * 
 * Zoomable and pannable floor plan display with route overlay.
 * Features:
 * - Pinch to zoom
 * - Pan/drag to navigate
 * - Auto-zoom to current step
 * - Route path overlay
 * - User position indicator
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, Image, Dimensions, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import {
    GestureHandlerRootView,
    GestureDetector,
    Gesture,
} from 'react-native-gesture-handler';
import { RouteNodeDto, PathPointDto } from '@/api/types';
import { theme } from '@/theme';
import { UserPositionPuck } from './UserPositionPuck';
import { RoutePathOverlay } from './RoutePathOverlay';

interface FloorPlanViewerProps {
    /** URL of the floor plan image */
    floorPlanUrl?: string;
    /** Current route path nodes */
    routeNodes: RouteNodeDto[];
    /** Current step index */
    currentStepIndex: number;
    /** Floor plan dimensions */
    planWidth?: number;
    planHeight?: number;
    /** Called when user interacts (disables auto-zoom) */
    onUserInteraction?: () => void;
    /** Whether auto-zoom is enabled */
    autoZoomEnabled?: boolean;
    /** Current floor ID - used to filter route nodes to show only current floor's route */
    currentFloorId?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

export function FloorPlanViewer({
    floorPlanUrl,
    routeNodes,
    currentStepIndex,
    planWidth = 800,
    planHeight = 600,
    onUserInteraction,
    autoZoomEnabled = true,
    currentFloorId,
}: FloorPlanViewerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Shared values for gestures
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Pinch gesture focal point tracking
    const pinchFocalX = useSharedValue(0);
    const pinchFocalY = useSharedValue(0);

    // Flag to track if pinch gesture is active (to prevent pan during pinch)
    const isPinching = useSharedValue(0);

    // Extract path points from route nodes - filtered by current floor
    const allPathPoints = useMemo((): PathPointDto[] => {
        const points: PathPointDto[] = [];

        // Filter route nodes by current floor if specified
        const floorFilteredNodes = currentFloorId
            ? routeNodes.filter(node => node.floorId === currentFloorId)
            : routeNodes;

        floorFilteredNodes.forEach((node) => {
            // Add corridor path points if available
            if (node.corridorPathPoints && node.corridorPathPoints.length > 0) {
                points.push(...node.corridorPathPoints);
            } else {
                // Fallback to node position
                points.push({ x: node.x, y: node.y });
            }
        });

        return points;
    }, [routeNodes, currentFloorId]);

    // Get current position
    const currentPosition = useMemo(() => {
        if (routeNodes.length === 0) return null;
        const node = routeNodes[Math.min(currentStepIndex, routeNodes.length - 1)];
        return { x: node.x, y: node.y };
    }, [routeNodes, currentStepIndex]);

    // Callback wrapper for UI thread safety
    const notifyUserInteraction = useCallback(() => {
        if (onUserInteraction) {
            onUserInteraction();
        }
    }, [onUserInteraction]);

    // Auto-zoom to current step
    useEffect(() => {
        if (!autoZoomEnabled || !currentPosition) return;

        const targetScale = 2;
        const centerX = (SCREEN_WIDTH / 2 - currentPosition.x * targetScale);
        const centerY = (SCREEN_HEIGHT / 3 - currentPosition.y * targetScale);

        scale.value = withTiming(targetScale, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
        });
        translateX.value = withTiming(centerX, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(centerY, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
        });

        savedScale.value = targetScale;
        savedTranslateX.value = centerX;
        savedTranslateY.value = centerY;
    }, [currentStepIndex, currentPosition, autoZoomEnabled]);

    // Pinch gesture for zooming - Google Maps-style simultaneous zoom and pan
    // The point under your fingers stays under your fingers as you zoom AND move
    const pinchGesture = Gesture.Pinch()
        .onStart((event) => {
            'worklet';
            // Mark pinch as active
            isPinching.value = 1;
            // Store initial focal point (where fingers started)
            pinchFocalX.value = event.focalX;
            pinchFocalY.value = event.focalY;
            // Store initial state
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        })
        .onUpdate((event) => {
            'worklet';
            const newScale = Math.min(Math.max(savedScale.value * event.scale, MIN_ZOOM), MAX_ZOOM);

            // Calculate the scale change ratio from the saved scale
            const scaleChange = newScale / savedScale.value;

            // Initial focal point (where fingers started)
            const initialFocalX = pinchFocalX.value;
            const initialFocalY = pinchFocalY.value;

            // Current focal point (where fingers are now)
            const currentFocalX = event.focalX;
            const currentFocalY = event.focalY;

            // Movement of focal point (pan component)
            const focalDeltaX = currentFocalX - initialFocalX;
            const focalDeltaY = currentFocalY - initialFocalY;

            // Combined transform:
            // 1. Start from saved position
            // 2. Apply zoom adjustment (keep initial focal point stationary during zoom)
            // 3. Add the focal point movement (pan as fingers move)
            translateX.value = savedTranslateX.value
                - (initialFocalX - savedTranslateX.value) * (scaleChange - 1)
                + focalDeltaX;
            translateY.value = savedTranslateY.value
                - (initialFocalY - savedTranslateY.value) * (scaleChange - 1)
                + focalDeltaY;

            scale.value = newScale;
        })
        .onEnd(() => {
            'worklet';
            // Mark pinch as inactive
            isPinching.value = 0;
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
            runOnJS(notifyUserInteraction)();
        });

    // Pan gesture for moving - only with single finger and when not pinching
    const panGesture = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart(() => {
            'worklet';
            // Only save state if not pinching
            if (isPinching.value === 0) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }
        })
        .onUpdate((event) => {
            'worklet';
            // Only apply pan if not pinching
            if (isPinching.value === 0) {
                translateX.value = savedTranslateX.value + event.translationX;
                translateY.value = savedTranslateY.value + event.translationY;
            }
        })
        .onEnd(() => {
            'worklet';
            if (isPinching.value === 0) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
                runOnJS(notifyUserInteraction)();
            }
        });

    // Combine gestures - pinch takes priority over pan
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture
    );

    // Animated style for the floor plan container
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Zoom control functions
    const zoomIn = useCallback(() => {
        const newScale = Math.min(scale.value * 1.5, MAX_ZOOM);
        scale.value = withTiming(newScale, { duration: 200 });
        savedScale.value = newScale;
        notifyUserInteraction();
    }, [scale, savedScale, notifyUserInteraction]);

    const zoomOut = useCallback(() => {
        const newScale = Math.max(scale.value / 1.5, MIN_ZOOM);
        scale.value = withTiming(newScale, { duration: 200 });
        savedScale.value = newScale;
        notifyUserInteraction();
    }, [scale, savedScale, notifyUserInteraction]);

    const recenter = useCallback(() => {
        if (!currentPosition) return;

        const targetScale = 2;
        const centerX = (SCREEN_WIDTH / 2 - currentPosition.x * targetScale);
        const centerY = (SCREEN_HEIGHT / 3 - currentPosition.y * targetScale);

        scale.value = withTiming(targetScale, { duration: 300 });
        translateX.value = withTiming(centerX, { duration: 300 });
        translateY.value = withTiming(centerY, { duration: 300 });

        savedScale.value = targetScale;
        savedTranslateX.value = centerX;
        savedTranslateY.value = centerY;
    }, [currentPosition, scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY]);

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={composedGesture}>
                <Animated.View
                    style={[
                        styles.floorPlanContainer,
                        animatedStyle,
                        { width: planWidth, height: planHeight }
                    ]}
                >
                    {/* Floor plan image */}
                    {floorPlanUrl ? (
                        <Image
                            source={{ uri: floorPlanUrl }}
                            style={[
                                styles.floorPlanImage,
                                { width: planWidth, height: planHeight },
                            ]}
                            resizeMode="contain"
                        />
                    ) : (
                        <View
                            style={[
                                styles.floorPlanPlaceholder,
                                {
                                    width: planWidth,
                                    height: planHeight,
                                    backgroundColor: isDark
                                        ? theme.colors.neutral[800]
                                        : theme.colors.neutral[100],
                                },
                            ]}
                        />
                    )}

                    {/* Route path overlay */}
                    {allPathPoints.length >= 2 && (
                        <RoutePathOverlay
                            points={allPathPoints}
                            width={planWidth}
                            height={planHeight}
                            currentStepIndex={currentStepIndex}
                            totalSteps={routeNodes.length}
                        />
                    )}

                    {/* User position puck */}
                    {currentPosition && (
                        <UserPositionPuck
                            x={currentPosition.x}
                            y={currentPosition.y}
                            size={28}
                        />
                    )}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

// Export zoom control interface for parent component
export interface FloorPlanControls {
    zoomIn: () => void;
    zoomOut: () => void;
    recenter: () => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    floorPlanContainer: {
        position: 'relative',
        transformOrigin: 'top left',
    },
    floorPlanImage: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    floorPlanPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: theme.borderRadius.md,
    },
});
