/**
 * Header Component
 * 
 * Consistent header for screens with title, back button, and actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface HeaderProps {
    /** Header title */
    title: string;
    /** Subtitle text */
    subtitle?: string;
    /** Show back button */
    showBack?: boolean;
    /** Custom back action */
    onBack?: () => void;
    /** Left action component */
    leftAction?: React.ReactNode;
    /** Right action component */
    rightAction?: React.ReactNode;
    /** Use transparent background */
    transparent?: boolean;
    /** Custom container style */
    style?: ViewStyle;
}

export function Header({
    title,
    subtitle,
    showBack = false,
    onBack,
    leftAction,
    rightAction,
    transparent = false,
    style,
}: HeaderProps) {
    const router = useRouter();
    const { fontSizeMultiplier } = useAccessibility();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View
            style={[
                styles.container,
                !transparent && styles.solidBackground,
                style,
            ]}
        >
            <View style={styles.leftSection}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                )}
                {leftAction}
            </View>

            <View style={styles.centerSection}>
                <Text
                    style={[
                        styles.title,
                        { fontSize: 18 * fontSizeMultiplier },
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        style={[
                            styles.subtitle,
                            { fontSize: 14 * fontSizeMultiplier },
                        ]}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>

            <View style={styles.rightSection}>
                {rightAction}
            </View>
        </View>
    );
}

/**
 * LargeHeader Component
 * 
 * Large header for main screens with prominent title.
 */
interface LargeHeaderProps {
    /** Header title */
    title: string;
    /** Subtitle or greeting */
    subtitle?: string;
    /** Right action component */
    rightAction?: React.ReactNode;
    /** Custom container style */
    style?: ViewStyle;
}

export function LargeHeader({
    title,
    subtitle,
    rightAction,
    style,
}: LargeHeaderProps) {
    const { fontSizeMultiplier } = useAccessibility();

    return (
        <View style={[styles.largeContainer, style]}>
            <View style={styles.largeContent}>
                {subtitle && (
                    <Text
                        style={[
                            styles.largeSubtitle,
                            { fontSize: 16 * fontSizeMultiplier },
                        ]}
                    >
                        {subtitle}
                    </Text>
                )}
                <Text
                    style={[
                        styles.largeTitle,
                        { fontSize: 28 * fontSizeMultiplier },
                    ]}
                >
                    {title}
                </Text>
            </View>
            {rightAction && <View style={styles.largeAction}>{rightAction}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.layout.safeAreaTop,
        paddingBottom: theme.spacing.md,
        minHeight: theme.layout.headerHeight + theme.layout.safeAreaTop,
    },
    solidBackground: {
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    leftSection: {
        width: 44,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    rightSection: {
        width: 44,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: theme.spacing.xs,
    },
    title: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },

    // Large header styles
    largeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.layout.safeAreaTop,
        paddingBottom: theme.spacing.lg,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    largeContent: {
        flex: 1,
    },
    largeSubtitle: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    largeTitle: {
        ...theme.textStyles.h1,
        color: theme.colors.textPrimary,
    },
    largeAction: {
        marginLeft: theme.spacing.md,
    },
});
