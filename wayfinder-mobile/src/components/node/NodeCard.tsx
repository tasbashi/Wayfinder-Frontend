/**
 * NodeCard Component
 * 
 * Displays node/location information in a card format.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, QrCode } from 'lucide-react-native';
import { theme, getShadowStyle, getNodeTypeColor, getNodeTypeBackground } from '@/theme';
import { NodeDto, NodeType, getNodeTypeName } from '@/api/types';
import { NodeTypeIcon } from './NodeTypeIcon';
import { Badge } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface NodeCardProps {
    /** Node data */
    node: NodeDto;
    /** Card press handler */
    onPress?: () => void;
    /** Show node type badge */
    showTypeBadge?: boolean;
    /** Show QR code indicator */
    showQRIndicator?: boolean;
    /** Show arrow indicator */
    showArrow?: boolean;
    /** Compact mode */
    compact?: boolean;
}

export function NodeCard({
    node,
    onPress,
    showTypeBadge = true,
    showQRIndicator = false,
    showArrow = true,
    compact = false,
}: NodeCardProps) {
    const { fontSizeMultiplier } = useAccessibility();
    const nodeType = typeof node.nodeType === 'number' ? node.nodeType : NodeType.Unknown;
    const typeName = getNodeTypeName(nodeType);
    const hasQR = !!node.qrCode;

    return (
        <TouchableOpacity
            style={[styles.container, compact && styles.containerCompact]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <NodeTypeIcon
                nodeType={nodeType}
                size={compact ? 18 : 22}
                showBackground
                style={compact ? styles.iconCompact : styles.icon}
            />

            <View style={styles.content}>
                <Text
                    style={[
                        styles.name,
                        compact && styles.nameCompact,
                        { fontSize: (compact ? 14 : 16) * fontSizeMultiplier },
                    ]}
                    numberOfLines={1}
                >
                    {node.name || 'Unnamed Location'}
                </Text>

                <View style={styles.metaRow}>
                    {showTypeBadge && (
                        <Badge
                            label={typeName}
                            variant="neutral"
                            size="small"
                        />
                    )}

                    {showQRIndicator && hasQR && (
                        <View style={styles.qrIndicator}>
                            <QrCode size={12} color={theme.colors.success[500]} />
                        </View>
                    )}
                </View>
            </View>

            {showArrow && onPress && (
                <ChevronRight size={18} color={theme.colors.textTertiary} />
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
    containerCompact: {
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    iconCompact: {
        marginRight: theme.spacing.sm,
    },
    content: {
        flex: 1,
    },
    name: {
        ...theme.textStyles.labelLarge,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    nameCompact: {
        ...theme.textStyles.label,
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    qrIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
