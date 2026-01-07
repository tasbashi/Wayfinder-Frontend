/**
 * Badge Component
 * 
 * Small label for displaying status, type, or count.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'small' | 'medium';

interface BadgeProps {
    /** Badge text */
    label: string;
    /** Badge variant */
    variant?: BadgeVariant;
    /** Badge size */
    size?: BadgeSize;
    /** Icon to show before label */
    icon?: React.ReactNode;
    /** Custom container style */
    style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: theme.colors.primary[100], text: theme.colors.primary[700] },
    secondary: { bg: theme.colors.neutral[100], text: theme.colors.neutral[700] },
    success: { bg: theme.colors.success[100], text: theme.colors.success[700] },
    warning: { bg: theme.colors.warning[100], text: theme.colors.warning[700] },
    error: { bg: theme.colors.error[100], text: theme.colors.error[700] },
    info: { bg: theme.colors.info[100], text: theme.colors.info[700] },
    neutral: { bg: theme.colors.neutral[100], text: theme.colors.neutral[600] },
};

export function Badge({
    label,
    variant = 'primary',
    size = 'medium',
    icon,
    style,
}: BadgeProps) {
    const colors = variantStyles[variant];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.bg },
                size === 'small' && styles.smallContainer,
                style,
            ]}
        >
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
                style={[
                    styles.label,
                    { color: colors.text },
                    size === 'small' && styles.smallLabel,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

/**
 * CountBadge Component
 * 
 * Small circular badge for displaying counts.
 */
interface CountBadgeProps {
    count: number;
    maxCount?: number;
    variant?: BadgeVariant;
    style?: ViewStyle;
}

export function CountBadge({
    count,
    maxCount = 99,
    variant = 'primary',
    style,
}: CountBadgeProps) {
    const colors = variantStyles[variant];
    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

    return (
        <View
            style={[
                styles.countContainer,
                { backgroundColor: colors.bg },
                style,
            ]}
        >
            <Text
                style={[
                    styles.countLabel,
                    { color: colors.text },
                ]}
            >
                {displayCount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        alignSelf: 'flex-start',
    },
    smallContainer: {
        paddingHorizontal: theme.spacing.xs + 2,
        paddingVertical: 2,
    },
    label: {
        ...theme.textStyles.labelSmall,
    },
    smallLabel: {
        fontSize: 10,
    },
    icon: {
        marginRight: theme.spacing.xs,
    },

    // Count badge styles
    countContainer: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    countLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
});
