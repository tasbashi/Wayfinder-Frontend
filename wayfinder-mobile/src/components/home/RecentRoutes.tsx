/**
 * RecentRoutes Component
 * 
 * Displays recent navigation routes on the home screen.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Clock, Navigation, ChevronRight } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { Card } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';

export interface RecentRoute {
    id: string;
    startName: string;
    endName: string;
    buildingName?: string;
    timestamp: Date;
}

interface RecentRoutesProps {
    /** Recent routes to display */
    routes: RecentRoute[];
    /** Route press handler */
    onRoutePress?: (route: RecentRoute) => void;
    /** View all handler */
    onViewAll?: () => void;
    /** Max items to show */
    maxItems?: number;
}

export function RecentRoutes({
    routes,
    onRoutePress,
    onViewAll,
    maxItems = 3,
}: RecentRoutesProps) {
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const displayRoutes = routes.slice(0, maxItems);

    if (routes.length === 0) {
        return null;
    }

    const formatTime = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t('home.recentRoutes', 'Recent Routes')}
                </Text>
                {onViewAll && routes.length > maxItems && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Text style={[styles.viewAll, { fontSize: 14 * fontSizeMultiplier }]}>
                            {t('common.viewAll', 'View All')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {displayRoutes.map((route) => (
                <TouchableOpacity
                    key={route.id}
                    style={styles.routeCard}
                    onPress={() => onRoutePress?.(route)}
                    activeOpacity={0.7}
                    disabled={!onRoutePress}
                >
                    <View style={styles.iconContainer}>
                        <Navigation size={18} color={theme.colors.primary[500]} />
                    </View>

                    <View style={styles.routeInfo}>
                        <Text
                            style={[styles.routeName, { fontSize: 14 * fontSizeMultiplier }]}
                            numberOfLines={1}
                        >
                            {route.startName} → {route.endName}
                        </Text>
                        <View style={styles.routeMeta}>
                            <Clock size={12} color={theme.colors.textTertiary} />
                            <Text style={[styles.timestamp, { fontSize: 12 * fontSizeMultiplier }]}>
                                {formatTime(route.timestamp)}
                            </Text>
                            {route.buildingName && (
                                <Text style={[styles.building, { fontSize: 12 * fontSizeMultiplier }]}>
                                    • {route.buildingName}
                                </Text>
                            )}
                        </View>
                    </View>

                    {onRoutePress && (
                        <ChevronRight size={16} color={theme.colors.textTertiary} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
    },
    viewAll: {
        ...theme.textStyles.label,
        color: theme.colors.primary[500],
    },
    routeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...getShadowStyle('xs'),
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    routeInfo: {
        flex: 1,
    },
    routeName: {
        ...theme.textStyles.label,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    routeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timestamp: {
        ...theme.textStyles.caption,
        color: theme.colors.textTertiary,
    },
    building: {
        ...theme.textStyles.caption,
        color: theme.colors.textTertiary,
    },
});
