/**
 * BuildingCard Component
 * 
 * Displays building information in a card format.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building, ChevronRight, MapPin } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { BuildingDto } from '@/api/types';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface BuildingCardProps {
    /** Building data */
    building: BuildingDto;
    /** Card press handler */
    onPress?: () => void;
    /** Show floor count */
    showFloorCount?: boolean;
    /** Show arrow indicator */
    showArrow?: boolean;
}

export function BuildingCard({
    building,
    onPress,
    showFloorCount = true,
    showArrow = true,
}: BuildingCardProps) {
    const { fontSizeMultiplier } = useAccessibility();
    const floorCount = building.floors?.length || 0;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.iconContainer}>
                <Building size={24} color={theme.colors.primary[500]} />
            </View>

            <View style={styles.content}>
                <Text
                    style={[styles.name, { fontSize: 16 * fontSizeMultiplier }]}
                    numberOfLines={1}
                >
                    {building.name}
                </Text>

                {building.address && (
                    <View style={styles.addressRow}>
                        <MapPin size={12} color={theme.colors.textTertiary} />
                        <Text
                            style={[styles.address, { fontSize: 14 * fontSizeMultiplier }]}
                            numberOfLines={1}
                        >
                            {building.address}
                        </Text>
                    </View>
                )}

                {showFloorCount && (
                    <Text style={[styles.floorCount, { fontSize: 12 * fontSizeMultiplier }]}>
                        {floorCount} {floorCount === 1 ? 'floor' : 'floors'}
                    </Text>
                )}
            </View>

            {showArrow && onPress && (
                <ChevronRight size={20} color={theme.colors.textTertiary} />
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
        ...getShadowStyle('sm'),
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    content: {
        flex: 1,
    },
    name: {
        ...theme.textStyles.labelLarge,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    address: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    floorCount: {
        ...theme.textStyles.caption,
        color: theme.colors.textTertiary,
    },
});
