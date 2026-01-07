/**
 * NavigationHeader
 * 
 * Top overlay header showing current floor/location context and close button.
 * Features glassmorphism effect with gradient fade.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { X, Navigation } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';

interface NavigationHeaderProps {
    /** Current floor name */
    floorName: string;
    /** Building or section name */
    sectionName?: string;
    /** Called when close/exit is pressed */
    onClose: () => void;
}

export function NavigationHeader({
    floorName,
    sectionName,
    onClose,
}: NavigationHeaderProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm }]}>
            {/* Floor/Location Badge */}
            <View
                style={[
                    styles.locationBadge,
                    {
                        backgroundColor: isDark
                            ? 'rgba(30, 30, 40, 0.9)'
                            : 'rgba(255, 255, 255, 0.95)',
                    },
                ]}
            >
                <View style={styles.iconContainer}>
                    <Navigation size={18} color={theme.colors.primary[500]} />
                </View>
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.floorName,
                            { color: isDark ? '#ffffff' : theme.colors.textPrimary },
                        ]}
                        numberOfLines={1}
                    >
                        {floorName}
                    </Text>
                    {sectionName && (
                        <Text
                            style={[
                                styles.sectionName,
                                { color: isDark ? theme.colors.neutral[400] : theme.colors.textSecondary },
                            ]}
                            numberOfLines={1}
                        >
                            {sectionName}
                        </Text>
                    )}
                </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
                style={[
                    styles.closeButton,
                    {
                        backgroundColor: isDark
                            ? 'rgba(30, 30, 40, 0.9)'
                            : 'rgba(255, 255, 255, 0.95)',
                    },
                ]}
                onPress={onClose}
                accessibilityLabel="Close navigation"
                accessibilityRole="button"
            >
                <X
                    size={24}
                    color={isDark ? '#ffffff' : theme.colors.textPrimary}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        zIndex: 20,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        paddingVertical: theme.spacing.sm,
        paddingLeft: theme.spacing.sm,
        paddingRight: theme.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    textContainer: {
        justifyContent: 'center',
    },
    floorName: {
        ...theme.textStyles.label,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    sectionName: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 1,
    },
    closeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
});
