/**
 * Navigation Result Screen
 * 
 * Shows calculated route with step-by-step instructions.
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Switch, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Accessibility } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme, getShadowStyle } from '@/theme';
import { useNavigationStore } from '@/features/navigation';
import {
    SelectedLocations,
    InstructionCard,
    RouteOverview,
} from '@/components/navigation';
import { Header, LoadingSpinner, ErrorState } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function NavigationResultScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const {
        startNode,
        endNode,
        route,
        currentStepIndex,
        requireAccessible,
        isCalculating,
        error,
        setRequireAccessible,
        calculateRoute,
        swapNodes,
        goToStep,
        reset,
    } = useNavigationStore();

    // Calculate route when screen mounts or nodes change
    useEffect(() => {
        if (startNode && endNode && !route) {
            calculateRoute();
        }
    }, [startNode, endNode, route, calculateRoute]);

    // Handle back press
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // Handle close (reset and go home)
    const handleClose = useCallback(() => {
        reset();
        router.push('/');
    }, [reset, router]);

    // Handle swap nodes
    const handleSwap = useCallback(() => {
        swapNodes();
        calculateRoute();
    }, [swapNodes, calculateRoute]);

    // Handle accessible toggle
    const handleAccessibleToggle = useCallback(
        (value: boolean) => {
            setRequireAccessible(value);
            calculateRoute();
        },
        [setRequireAccessible, calculateRoute]
    );

    // Handle start navigation - go to turn-by-turn active navigation
    const handleStartNavigation = useCallback(() => {
        goToStep(0);
        router.push('/navigation/active');
    }, [goToStep, router]);

    // Edit start location
    const handleEditStart = useCallback(() => {
        router.push('/navigation/select-start');
    }, [router]);

    // Edit end location
    const handleEditEnd = useCallback(() => {
        router.push('/navigation/select-end');
    }, [router]);

    // Close button component
    const CloseButton = (
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
    );

    // Error state
    if (error && !isCalculating) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header
                    title={t('navigation.route', 'Route')}
                    showBack
                    onBack={handleBack}
                />
                <ErrorState
                    message={t('navigation.routeError', 'Could not calculate route')}
                    description={error}
                    onRetry={calculateRoute}
                />
            </SafeAreaView>
        );
    }

    // Loading state
    if (isCalculating) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header
                    title={t('navigation.route', 'Route')}
                    showBack
                    onBack={handleBack}
                />
                <LoadingSpinner fullScreen message={t('navigation.calculating', 'Calculating route...')} />
            </SafeAreaView>
        );
    }

    // No route yet
    if (!route) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header
                    title={t('navigation.route', 'Route')}
                    showBack
                    onBack={handleBack}
                />
                <View style={styles.noRouteContainer}>
                    <Text style={[styles.noRouteText, { fontSize: 16 * fontSizeMultiplier }]}>
                        {t('navigation.selectLocations', 'Select start and end locations to calculate route')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                title={t('navigation.route', 'Route')}
                showBack
                onBack={handleBack}
                rightAction={CloseButton}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Selected locations */}
                <View style={styles.section}>
                    <SelectedLocations
                        startNode={startNode}
                        endNode={endNode}
                        onSwap={handleSwap}
                        onPressStart={handleEditStart}
                        onPressEnd={handleEditEnd}
                    />
                </View>

                {/* Accessible toggle */}
                <View style={styles.accessibleRow}>
                    <View style={styles.accessibleInfo}>
                        <Accessibility size={20} color={theme.colors.primary[500]} />
                        <Text style={[styles.accessibleLabel, { fontSize: 14 * fontSizeMultiplier }]}>
                            {t('navigation.accessibleRoute', 'Wheelchair Accessible')}
                        </Text>
                    </View>
                    <Switch
                        value={requireAccessible}
                        onValueChange={handleAccessibleToggle}
                        trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[300] }}
                        thumbColor={requireAccessible ? theme.colors.primary[500] : theme.colors.neutral[50]}
                    />
                </View>

                {/* Route overview */}
                <View style={styles.section}>
                    <RouteOverview
                        route={route}
                        isAccessible={requireAccessible}
                        onStartNavigation={handleStartNavigation}
                    />
                </View>

                {/* Instructions list */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                        {t('navigation.directions', 'Directions')}
                    </Text>
                    {route.path.map((node, index) => (
                        <InstructionCard
                            key={`${node.nodeId}-${index}`}
                            routeNode={node}
                            stepIndex={index + 1}
                            totalSteps={route.path.length}
                            isCurrent={index === currentStepIndex}
                            isCompleted={index < currentStepIndex}
                            onPress={() => goToStep(index)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerButton: {
        padding: theme.spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    section: {
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    accessibleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.backgroundCard,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...getShadowStyle('xs'),
    },
    accessibleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    accessibleLabel: {
        ...theme.textStyles.label,
        color: theme.colors.textPrimary,
    },
    noRouteContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    noRouteText: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
