/**
 * Home Screen
 * 
 * Main home tab with hero card, quick actions, and recent routes.
 * Rewritten to use new component library and hooks.
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { HeroCard, QuickActionsGrid, RecentRoutes, RecentRoute } from '@/components/home';

// Mock recent routes (would come from storage/API in production)
const mockRecentRoutes = [
    {
        id: '1',
        startName: 'Main Entrance',
        endName: 'Room 205',
        buildingName: 'Hospital A',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    },
    {
        id: '2',
        startName: 'Emergency',
        endName: 'Pharmacy',
        buildingName: 'Hospital A',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [recentRoutes, setRecentRoutes] = useState(mockRecentRoutes);

    // Handle pull-to-refresh
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        // Simulate refresh
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    }, []);

    // Navigation handlers
    const handleStartNavigation = useCallback(() => {
        router.push('/(tabs)/explore');
    }, [router]);

    const handleScanQR = useCallback(() => {
        router.push('/(tabs)/scanner');
    }, [router]);

    const handleBrowseBuildings = useCallback(() => {
        router.push('/(tabs)/explore');
    }, [router]);

    const handleSearch = useCallback(() => {
        router.push('/(tabs)/explore');
    }, [router]);

    const handleFavorites = useCallback(() => {
        router.push('/favorites');
    }, [router]);

    const handleRoutePress = useCallback(
        (route: RecentRoute) => {
            // Could navigate to route detail or recalculate
            console.log('Route pressed:', route);
        },
        []
    );

    const handleViewAllRoutes = useCallback(() => {
        router.push('/recent');
    }, [router]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.greeting, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t('home.greeting', 'Welcome to')}
                </Text>
                <Text style={[styles.title, { fontSize: 28 * fontSizeMultiplier }]}>
                    Wayfinder
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary[500]}
                        colors={[theme.colors.primary[500]]}
                    />
                }
            >
                {/* Hero Card */}
                <HeroCard
                    onStartNavigation={handleStartNavigation}
                />

                {/* Quick Actions */}
                <QuickActionsGrid
                    onScanQR={handleScanQR}
                    onBrowseBuildings={handleBrowseBuildings}
                    onSearch={handleSearch}
                    onFavorites={handleFavorites}
                />

                {/* Recent Routes */}
                <RecentRoutes
                    routes={recentRoutes}
                    onRoutePress={handleRoutePress}
                    onViewAll={handleViewAllRoutes}
                />

                {/* Bottom spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.layout.safeAreaTop,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    greeting: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
    },
    title: {
        ...theme.textStyles.h1,
        color: theme.colors.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    bottomSpacer: {
        height: theme.spacing.xl,
    },
});
