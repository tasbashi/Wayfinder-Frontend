/**
 * SafeContainer Component
 * 
 * Safe area wrapper with consistent background and styling.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { theme } from '@/theme';

interface SafeContainerProps {
    /** Container content */
    children: React.ReactNode;
    /** Background color */
    backgroundColor?: string;
    /** Edges to apply safe area (simplified - mainly for padding) */
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    /** Custom container style */
    style?: ViewStyle;
}

export function SafeContainer({
    children,
    backgroundColor = theme.colors.background,
    edges = ['top'],
    style,
}: SafeContainerProps) {
    const containerStyle: ViewStyle = {
        ...styles.container,
        backgroundColor,
        paddingTop: edges.includes('top') ? theme.layout.safeAreaTop : 0,
        ...style,
    };

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={backgroundColor}
                translucent={Platform.OS === 'android'}
            />
            <View style={containerStyle}>{children}</View>
        </>
    );
}

/**
 * ScreenContainer Component
 * 
 * Full screen container with safe areas and consistent padding.
 */
interface ScreenContainerProps {
    children: React.ReactNode;
    /** Add horizontal padding */
    padded?: boolean;
    /** Use scroll view */
    scrollable?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Custom style */
    style?: ViewStyle;
}

export function ScreenContainer({
    children,
    padded = false,
    backgroundColor = theme.colors.background,
    style,
}: ScreenContainerProps) {
    return (
        <View
            style={[
                styles.screen,
                { backgroundColor },
                padded && styles.padded,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screen: {
        flex: 1,
    },
    padded: {
        paddingHorizontal: theme.layout.screenPaddingHorizontal,
    },
});
