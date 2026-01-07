/**
 * SelectedLocations Component
 * 
 * Shows selected start and end locations with swap capability.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, ArrowUpDown, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme, getShadowStyle } from '@/theme';
import { NodeDto } from '@/api/types';
import { NodeTypeIcon } from '@/components/node';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface SelectedLocationsProps {
    /** Start node */
    startNode: NodeDto | null;
    /** End node */
    endNode: NodeDto | null;
    /** Swap nodes handler */
    onSwap?: () => void;
    /** Clear start node */
    onClearStart?: () => void;
    /** Clear end node */
    onClearEnd?: () => void;
    /** Press start node to edit */
    onPressStart?: () => void;
    /** Press end node to edit */
    onPressEnd?: () => void;
    /** Compact mode */
    compact?: boolean;
}

export function SelectedLocations({
    startNode,
    endNode,
    onSwap,
    onClearStart,
    onClearEnd,
    onPressStart,
    onPressEnd,
    compact = false,
}: SelectedLocationsProps) {
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            {/* Start Location */}
            <TouchableOpacity
                style={[styles.locationRow, !startNode && styles.locationRowEmpty]}
                onPress={onPressStart}
                disabled={!onPressStart}
            >
                <View style={[styles.marker, styles.markerStart]}>
                    <View style={styles.markerDotStart} />
                </View>
                <View style={styles.locationContent}>
                    {startNode ? (
                        <>
                            <Text
                                style={[styles.locationName, { fontSize: 15 * fontSizeMultiplier }]}
                                numberOfLines={1}
                            >
                                {startNode.name || 'Unnamed Location'}
                            </Text>
                            <Text style={[styles.locationLabel, { fontSize: 12 * fontSizeMultiplier }]}>
                                {t('navigation.startPoint', 'Start')}
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.placeholder, { fontSize: 15 * fontSizeMultiplier }]}>
                            {t('navigation.selectStartLocation', 'Select start location')}
                        </Text>
                    )}
                </View>
                {startNode && onClearStart && (
                    <TouchableOpacity style={styles.clearButton} onPress={onClearStart}>
                        <X size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Connector line + Swap button */}
            <View style={styles.connector}>
                <View style={styles.connectorLine} />
                {onSwap && startNode && endNode && (
                    <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
                        <ArrowUpDown size={18} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* End Location */}
            <TouchableOpacity
                style={[styles.locationRow, !endNode && styles.locationRowEmpty]}
                onPress={onPressEnd}
                disabled={!onPressEnd}
            >
                <View style={[styles.marker, styles.markerEnd]}>
                    <Navigation size={14} color="#fff" />
                </View>
                <View style={styles.locationContent}>
                    {endNode ? (
                        <>
                            <Text
                                style={[styles.locationName, { fontSize: 15 * fontSizeMultiplier }]}
                                numberOfLines={1}
                            >
                                {endNode.name || 'Unnamed Location'}
                            </Text>
                            <Text style={[styles.locationLabel, { fontSize: 12 * fontSizeMultiplier }]}>
                                {t('navigation.destination', 'Destination')}
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.placeholder, { fontSize: 15 * fontSizeMultiplier }]}>
                            {t('navigation.selectDestination', 'Select destination')}
                        </Text>
                    )}
                </View>
                {endNode && onClearEnd && (
                    <TouchableOpacity style={styles.clearButton} onPress={onClearEnd}>
                        <X size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...getShadowStyle('sm'),
    },
    containerCompact: {
        padding: theme.spacing.sm,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    locationRowEmpty: {
        opacity: 0.7,
    },
    marker: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    markerStart: {
        backgroundColor: theme.colors.success[100],
        borderWidth: 2,
        borderColor: theme.colors.success[500],
    },
    markerDotStart: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.success[500],
    },
    markerEnd: {
        backgroundColor: theme.colors.primary[500],
    },
    locationContent: {
        flex: 1,
    },
    locationName: {
        ...theme.textStyles.label,
        color: theme.colors.textPrimary,
    },
    locationLabel: {
        ...theme.textStyles.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    placeholder: {
        ...theme.textStyles.body,
        color: theme.colors.textTertiary,
    },
    clearButton: {
        padding: theme.spacing.xs,
    },
    connector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 13, // Align with marker center
    },
    connectorLine: {
        width: 2,
        height: 24,
        backgroundColor: theme.colors.border,
        marginRight: theme.spacing.lg,
    },
    swapButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        marginRight: theme.spacing.sm,
    },
});
