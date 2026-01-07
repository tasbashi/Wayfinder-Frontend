/**
 * PrimaryInstruction
 * 
 * Large, prominent display of the current navigation instruction.
 * Shows direction icon, instruction text, and distance.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import {
    ArrowUp,
    ArrowLeft,
    ArrowRight,
    CornerUpLeft,
    CornerUpRight,
    ArrowUpCircle,
    ArrowDownCircle,
    Navigation,
    type LucideIcon,
} from 'lucide-react-native';
import { NodeType, RouteNodeDto } from '@/api/types';
import { theme } from '@/theme';

interface PrimaryInstructionProps {
    /** Current route node with instruction */
    routeNode: RouteNodeDto;
    /** Distance to next waypoint in meters */
    distance: number;
}

/**
 * Determine direction icon based on instruction text
 */
function getDirectionIcon(instruction: string): LucideIcon {
    const lower = instruction.toLowerCase();

    if (lower.includes('left')) return CornerUpLeft;
    if (lower.includes('right')) return CornerUpRight;
    if (lower.includes('elevator') || lower.includes('up')) return ArrowUpCircle;
    if (lower.includes('stairs') && lower.includes('down')) return ArrowDownCircle;
    if (lower.includes('stairs')) return ArrowUpCircle;
    if (lower.includes('straight') || lower.includes('continue')) return ArrowUp;

    return Navigation;
}

/**
 * Get a simplified instruction title
 */
function getInstructionTitle(instruction: string): string {
    const lower = instruction.toLowerCase();

    if (lower.includes('turn left')) return 'Turn Left';
    if (lower.includes('turn right')) return 'Turn Right';
    if (lower.includes('go straight') || lower.includes('continue')) return 'Go Straight';
    if (lower.includes('take elevator')) return 'Take Elevator';
    if (lower.includes('take stairs')) return 'Take Stairs';
    if (lower.includes('arrive') || lower.includes('destination')) return 'Arrived';

    // First two words as fallback
    const words = instruction.split(' ');
    return words.slice(0, 2).join(' ');
}

/**
 * Format distance for display
 */
function formatDistance(meters: number): { value: string; unit: string } {
    if (meters < 1) {
        return { value: '<1', unit: 'm' };
    }
    if (meters < 1000) {
        return { value: Math.round(meters).toString(), unit: 'm' };
    }
    return { value: (meters / 1000).toFixed(1), unit: 'km' };
}

export function PrimaryInstruction({
    routeNode,
    distance,
}: PrimaryInstructionProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const DirectionIcon = getDirectionIcon(routeNode.instruction);
    const title = getInstructionTitle(routeNode.instruction);
    const { value: distValue, unit: distUnit } = formatDistance(distance);

    // Subtitle: node name or landmark
    const subtitle = routeNode.name
        ? `at ${routeNode.name}`
        : `on ${routeNode.floorName}`;

    return (
        <View style={styles.container}>
            {/* Direction Icon */}
            <View style={styles.iconContainer}>
                <DirectionIcon size={36} color="#ffffff" />
            </View>

            {/* Instruction Text */}
            <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                    <Text
                        style={[
                            styles.title,
                            { color: isDark ? '#ffffff' : theme.colors.textPrimary },
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    <View style={styles.distanceContainer}>
                        <Text
                            style={[
                                styles.distanceValue,
                                { color: isDark ? '#ffffff' : theme.colors.textPrimary },
                            ]}
                        >
                            {distValue}
                        </Text>
                        <Text
                            style={[
                                styles.distanceUnit,
                                { color: isDark ? theme.colors.neutral[400] : theme.colors.textSecondary },
                            ]}
                        >
                            {' '}{distUnit}
                        </Text>
                    </View>
                </View>
                <Text
                    style={[
                        styles.subtitle,
                        { color: isDark ? theme.colors.neutral[400] : theme.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {subtitle}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: theme.colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    textContainer: {
        flex: 1,
        minWidth: 0,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        flex: 1,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginLeft: theme.spacing.sm,
    },
    distanceValue: {
        fontSize: 26,
        fontWeight: '700',
    },
    distanceUnit: {
        fontSize: 14,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 2,
    },
});
