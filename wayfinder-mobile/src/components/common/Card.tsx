/**
 * Card Component
 * 
 * Base card container with consistent styling.
 * Supports press interaction and different shadow levels.
 */

import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TouchableOpacityProps,
} from 'react-native';
import { theme, getShadowStyle, ShadowKey } from '@/theme';

interface CardProps {
    /** Card content */
    children: React.ReactNode;
    /** Shadow level */
    shadow?: ShadowKey;
    /** Border radius preset */
    radius?: keyof typeof theme.borderRadius;
    /** Internal padding */
    padding?: keyof typeof theme.spacing;
    /** Whether card is pressable */
    onPress?: () => void;
    /** Custom container style */
    style?: ViewStyle;
    /** Active opacity for press (only if onPress provided) */
    activeOpacity?: number;
}

export function Card({
    children,
    shadow = 'sm',
    radius = 'md',
    padding = 'md',
    onPress,
    style,
    activeOpacity = 0.7,
}: CardProps) {
    const containerStyle: ViewStyle = {
        ...styles.base,
        borderRadius: theme.borderRadius[radius],
        padding: theme.spacing[padding],
        ...getShadowStyle(shadow),
        ...style,
    };

    if (onPress) {
        return (
            <TouchableOpacity
                style={containerStyle}
                onPress={onPress}
                activeOpacity={activeOpacity}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={containerStyle}>{children}</View>;
}

/**
 * CardHeader Component
 * 
 * Consistent header section for cards with title and optional action.
 */
interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
    return <View style={[styles.header, style]}>{children}</View>;
}

/**
 * CardContent Component
 * 
 * Main content area of a card.
 */
interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
    return <View style={[styles.content, style]}>{children}</View>;
}

/**
 * CardFooter Component
 * 
 * Footer section for actions or additional info.
 */
interface CardFooterProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
    return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: theme.colors.backgroundCard,
        overflow: 'hidden',
    },
    header: {
        marginBottom: theme.spacing.sm,
    },
    content: {
        // Default content styles if needed
    },
    footer: {
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
});
