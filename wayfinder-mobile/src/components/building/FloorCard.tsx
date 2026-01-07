/**
 * FloorCard Component
 * 
 * Displays floor information in a card format.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Layers, ChevronRight } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { FloorDto } from '@/api/types';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface FloorCardProps {
    /** Floor data */
    floor: FloorDto;
    /** Card press handler */
    onPress?: () => void;
    /** Show arrow indicator */
    showArrow?: boolean;
    /** Compact mode */
    compact?: boolean;
}

export function FloorCard({
    floor,
    onPress,
    showArrow = true,
    compact = false,
}: FloorCardProps) {
    const { fontSizeMultiplier } = useAccessibility();

    return (
        <TouchableOpacity
            style={[styles.container, compact && styles.containerCompact]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
                <Layers size={compact ? 18 : 22} color={theme.colors.primary[500]} />
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.name,
                        compact && styles.nameCompact,
                        { fontSize: (compact ? 14 : 16) * fontSizeMultiplier },
                    ]}
                    numberOfLines={1}
                >
                    {floor.name}
                </Text>
            </View>

            {showArrow && onPress && (
                <ChevronRight size={18} color={theme.colors.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...getShadowStyle('xs'),
    },
    containerCompact: {
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    iconContainerCompact: {
        width: 32,
        height: 32,
    },
    content: {
        flex: 1,
    },
    name: {
        ...theme.textStyles.label,
        color: theme.colors.textPrimary,
    },
    nameCompact: {
        ...theme.textStyles.bodySmall,
        fontWeight: '500',
    },
});
