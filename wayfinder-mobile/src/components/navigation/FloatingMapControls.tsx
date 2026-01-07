/**
 * FloatingMapControls
 * 
 * Floating action buttons for map control: zoom in/out, recenter, audio toggle.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Plus, Minus, Navigation, Volume2, VolumeX } from 'lucide-react-native';
import { theme } from '@/theme';

interface FloatingMapControlsProps {
    /** Zoom in handler */
    onZoomIn: () => void;
    /** Zoom out handler */
    onZoomOut: () => void;
    /** Recenter handler */
    onRecenter: () => void;
    /** Audio toggle handler */
    onToggleAudio?: () => void;
    /** Is audio enabled */
    audioEnabled?: boolean;
}

export function FloatingMapControls({
    onZoomIn,
    onZoomOut,
    onRecenter,
    onToggleAudio,
    audioEnabled = true,
}: FloatingMapControlsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const buttonBg = isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const iconColor = isDark ? '#ffffff' : theme.colors.textPrimary;
    const mutedIconColor = isDark ? theme.colors.neutral[500] : theme.colors.neutral[400];

    return (
        <View style={styles.container}>
            {/* Zoom Controls Group */}
            <View style={[styles.buttonGroup, { backgroundColor: buttonBg }]}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonTop]}
                    onPress={onZoomIn}
                    accessibilityLabel="Zoom in"
                    accessibilityRole="button"
                >
                    <Plus size={20} color={iconColor} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border }]} />

                <TouchableOpacity
                    style={[styles.button, styles.buttonBottom]}
                    onPress={onZoomOut}
                    accessibilityLabel="Zoom out"
                    accessibilityRole="button"
                >
                    <Minus size={20} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* Recenter FAB */}
            <TouchableOpacity
                style={[styles.primaryFab]}
                onPress={onRecenter}
                accessibilityLabel="Recenter map"
                accessibilityRole="button"
            >
                <Navigation size={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Audio Toggle */}
            {onToggleAudio && (
                <TouchableOpacity
                    style={[styles.secondaryFab, { backgroundColor: buttonBg }]}
                    onPress={onToggleAudio}
                    accessibilityLabel={audioEnabled ? 'Disable audio' : 'Enable audio'}
                    accessibilityRole="button"
                >
                    {audioEnabled ? (
                        <Volume2 size={20} color={iconColor} />
                    ) : (
                        <VolumeX size={20} color={mutedIconColor} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: theme.spacing.md,
        top: '40%',
        alignItems: 'center',
        gap: theme.spacing.md,
        zIndex: 10,
    },
    buttonGroup: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    button: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTop: {
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
    },
    buttonBottom: {
        borderBottomLeftRadius: theme.borderRadius.lg,
        borderBottomRightRadius: theme.borderRadius.lg,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    primaryFab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryFab: {
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
