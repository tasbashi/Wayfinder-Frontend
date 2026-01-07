/**
 * QuickActionsGrid Component
 * 
 * Grid of quick action buttons for the home screen.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { QrCode, Building, Search, Star, Clock, Accessibility } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';

interface QuickAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    bgColor: string;
}

interface QuickActionsGridProps {
    /** Scan QR code handler */
    onScanQR: () => void;
    /** Browse buildings handler */
    onBrowseBuildings: () => void;
    /** Search handler */
    onSearch: () => void;
    /** Favorites handler */
    onFavorites?: () => void;
    /** Recent handler */
    onRecent?: () => void;
    /** Accessibility handler */
    onAccessibility?: () => void;
}

export function QuickActionsGrid({
    onScanQR,
    onBrowseBuildings,
    onSearch,
    onFavorites,
    onRecent,
    onAccessibility,
}: QuickActionsGridProps) {
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const actions: (QuickAction & { onPress: () => void })[] = [
        {
            id: 'scan',
            icon: <QrCode size={24} color={theme.colors.primary[600]} />,
            label: t('home.scanQR', 'Scan QR'),
            color: theme.colors.primary[600],
            bgColor: theme.colors.primary[50],
            onPress: onScanQR,
        },
        {
            id: 'buildings',
            icon: <Building size={24} color={theme.colors.success[600]} />,
            label: t('home.buildings', 'Buildings'),
            color: theme.colors.success[600],
            bgColor: theme.colors.success[50],
            onPress: onBrowseBuildings,
        },
        {
            id: 'search',
            icon: <Search size={24} color={theme.colors.info[600]} />,
            label: t('home.search', 'Search'),
            color: theme.colors.info[600],
            bgColor: theme.colors.info[50],
            onPress: onSearch,
        },
        {
            id: 'favorites',
            icon: <Star size={24} color={theme.colors.warning[600]} />,
            label: t('home.favorites', 'Favorites'),
            color: theme.colors.warning[600],
            bgColor: theme.colors.warning[50],
            onPress: onFavorites || (() => { }),
        },
    ];

    // Filter out actions without handlers
    const availableActions = actions.filter((action) => {
        if (action.id === 'favorites' && !onFavorites) return false;
        return true;
    });

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: 16 * fontSizeMultiplier }]}>
                {t('home.quickActions', 'Quick Actions')}
            </Text>

            <View style={styles.grid}>
                {availableActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionButton}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                            {action.icon}
                        </View>
                        <Text
                            style={[styles.actionLabel, { fontSize: 12 * fontSizeMultiplier }]}
                            numberOfLines={1}
                        >
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    title: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    actionButton: {
        width: '23%',
        alignItems: 'center',
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        ...getShadowStyle('xs'),
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    actionLabel: {
        ...theme.textStyles.labelSmall,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
