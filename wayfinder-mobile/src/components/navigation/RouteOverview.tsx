/**
 * RouteOverview Component
 * 
 * Summary of route with total distance, time, and action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, Accessibility, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme, getShadowStyle } from '@/theme';
import { PathResultExtended } from '@/api/types';
import { Button } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface RouteOverviewProps {
    /** Route result */
    route: PathResultExtended;
    /** Is accessible route */
    isAccessible?: boolean;
    /** Start navigation handler */
    onStartNavigation?: () => void;
    /** Recalculate handler */
    onRecalculate?: () => void;
}

export function RouteOverview({
    route,
    isAccessible = false,
    onStartNavigation,
    onRecalculate,
}: RouteOverviewProps) {
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.ceil(seconds / 60);
        if (minutes < 60) {
            return `${minutes} ${t('common.minutes', 'min')}`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <View style={styles.container}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <MapPin size={18} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>
                        {formatDistance(route.totalDistance)}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: 12 * fontSizeMultiplier }]}>
                        {t('navigation.distance', 'Distance')}
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <Clock size={18} color={theme.colors.success[500]} />
                    </View>
                    <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>
                        {formatTime(route.estimatedTimeSeconds)}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: 12 * fontSizeMultiplier }]}>
                        {t('navigation.time', 'Est. Time')}
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.stat}>
                    <View style={styles.statIcon}>
                        <Navigation size={18} color={theme.colors.info[500]} />
                    </View>
                    <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>
                        {route.path.length}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: 12 * fontSizeMultiplier }]}>
                        {t('navigation.steps', 'Steps')}
                    </Text>
                </View>
            </View>

            {/* Accessible badge */}
            {isAccessible && (
                <View style={styles.accessibleBadge}>
                    <Accessibility size={16} color={theme.colors.success[600]} />
                    <Text style={[styles.accessibleText, { fontSize: 13 * fontSizeMultiplier }]}>
                        {t('navigation.wheelchairAccessible', 'Wheelchair Accessible Route')}
                    </Text>
                </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
                {onStartNavigation && (
                    <Button
                        title={t('navigation.startNavigation', 'Start Navigation')}
                        variant="primary"
                        size="large"
                        onPress={onStartNavigation}
                        fullWidth
                        leftIcon={<Navigation size={18} color="#fff" />}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...getShadowStyle('md'),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.lg,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        marginBottom: theme.spacing.xs,
    },
    statValue: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
    },
    statLabel: {
        ...theme.textStyles.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: theme.colors.border,
    },
    accessibleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.success[50],
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
    },
    accessibleText: {
        ...theme.textStyles.label,
        color: theme.colors.success[700],
    },
    actions: {
        gap: theme.spacing.sm,
    },
});
