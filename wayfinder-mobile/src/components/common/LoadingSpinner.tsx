/**
 * LoadingSpinner Component
 * 
 * Centered loading indicator with optional text.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface LoadingSpinnerProps {
    /** Loading message */
    message?: string;
    /** Spinner size */
    size?: 'small' | 'large';
    /** Spinner color */
    color?: string;
    /** Fill available space */
    fullScreen?: boolean;
    /** Custom container style */
    style?: ViewStyle;
}

export function LoadingSpinner({
    message,
    size = 'large',
    color = theme.colors.primary[500],
    fullScreen = false,
    style,
}: LoadingSpinnerProps) {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

/**
 * LoadingOverlay Component
 * 
 * Full-screen semi-transparent loading overlay.
 */
interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.overlayContent}>
                <ActivityIndicator size="large" color="#fff" />
                {message && <Text style={styles.overlayMessage}>{message}</Text>}
            </View>
        </View>
    );
}

/**
 * InlineLoading Component
 * 
 * Small inline loading indicator for buttons or small sections.
 */
interface InlineLoadingProps {
    message?: string;
    color?: string;
}

export function InlineLoading({
    message,
    color = theme.colors.primary[500]
}: InlineLoadingProps) {
    return (
        <View style={styles.inline}>
            <ActivityIndicator size="small" color={color} />
            {message && <Text style={styles.inlineMessage}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    message: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },

    // Overlay styles
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    overlayContent: {
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    overlayMessage: {
        ...theme.textStyles.body,
        color: '#fff',
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },

    // Inline styles
    inline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    inlineMessage: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.textSecondary,
    },
});
