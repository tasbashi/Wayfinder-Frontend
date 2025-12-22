import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { colors, borderRadius, shadows } from '@/utils/theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled';
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function Card({
    children,
    variant = 'elevated',
    onPress,
    disabled = false,
    style,
}: CardProps) {
    const cardStyles = [
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        disabled && styles.disabled,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyles}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.lg,
        padding: 16,
        backgroundColor: colors.surface,
    },
    elevated: {
        ...shadows.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    filled: {
        backgroundColor: colors.borderLight,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default Card;
