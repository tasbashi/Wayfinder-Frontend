/**
 * NavigationStats
 * 
 * Displays navigation progress: time remaining, distance, ETA, and progress bar.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { theme } from '@/theme';

interface NavigationStatsProps {
    /** Remaining time in seconds */
    remainingTimeSeconds: number;
    /** Remaining distance in meters */
    remainingDistance: number;
    /** Current step index (0-based) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** ETA time string (optional) */
    etaTime?: string;
}

/**
 * Format seconds to human readable time
 */
function formatTime(seconds: number): string {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format distance for display
 */
function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m remaining`;
    }
    return `${(meters / 1000).toFixed(1)} km remaining`;
}

export function NavigationStats({
    remainingTimeSeconds,
    remainingDistance,
    currentStep,
    totalSteps,
    etaTime,
}: NavigationStatsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Calculate progress percentage
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    // Generate ETA if not provided
    const displayEta = etaTime || new Date(Date.now() + remainingTimeSeconds * 1000)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={styles.container}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statsLeft}>
                    <Text style={styles.timeText}>
                        {formatTime(remainingTimeSeconds)}
                    </Text>
                    <Text
                        style={[
                            styles.separator,
                            { color: isDark ? theme.colors.neutral[600] : theme.colors.neutral[400] },
                        ]}
                    >
                        •
                    </Text>
                    <Text
                        style={[
                            styles.distanceText,
                            { color: isDark ? theme.colors.neutral[400] : theme.colors.textSecondary },
                        ]}
                    >
                        {formatDistance(remainingDistance)}
                    </Text>
                </View>
                <Text
                    style={[
                        styles.etaText,
                        { color: isDark ? theme.colors.neutral[500] : theme.colors.neutral[400] },
                    ]}
                >
                    {displayEta} ETA
                </Text>
            </View>

            {/* Progress Bar */}
            <View
                style={[
                    styles.progressTrack,
                    {
                        backgroundColor: isDark
                            ? 'rgba(45, 48, 66, 1)'
                            : theme.colors.neutral[200],
                    },
                ]}
            >
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.min(progress, 100)}%` },
                    ]}
                >
                    {/* Shine effect */}
                    <View style={styles.progressShine} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.spacing.sm,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xs,
    },
    statsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    timeText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.success[400],
    },
    separator: {
        fontSize: 12,
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '500',
    },
    etaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary[500],
        borderRadius: 4,
        position: 'relative',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    progressShine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        opacity: 0.3,
    },
});
