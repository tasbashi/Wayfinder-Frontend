/**
 * NodeTypeIcon Component
 * 
 * Displays appropriate icon based on NodeType.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
    DoorOpen,
    CornerUpRight,
    ArrowUpDown,
    ArrowUpSquare,
    DoorClosed,
    Bath,
    Info,
    HelpCircle,
    LucideIcon,
} from 'lucide-react-native';
import { theme, getNodeTypeColor, getNodeTypeBackground } from '@/theme';
import { NodeType } from '@/api/types';

interface NodeTypeIconProps {
    /** Node type */
    nodeType: NodeType;
    /** Icon size */
    size?: number;
    /** Show background container */
    showBackground?: boolean;
    /** Custom color override */
    color?: string;
    /** Custom style */
    style?: ViewStyle;
}

// Map NodeType to icon component
const nodeTypeIcons: Record<NodeType, LucideIcon> = {
    [NodeType.Room]: DoorOpen,
    [NodeType.Corridor]: CornerUpRight,
    [NodeType.Elevator]: ArrowUpDown,
    [NodeType.Stairs]: ArrowUpSquare,
    [NodeType.Entrance]: DoorClosed,
    [NodeType.Restroom]: Bath,
    [NodeType.InformationDesk]: Info,
    [NodeType.Unknown]: HelpCircle,
};

export function NodeTypeIcon({
    nodeType,
    size = 24,
    showBackground = false,
    color,
    style,
}: NodeTypeIconProps) {
    const IconComponent = nodeTypeIcons[nodeType] || nodeTypeIcons[NodeType.Unknown];
    const iconColor = color || getNodeTypeColor(NodeType[nodeType]);

    if (showBackground) {
        const bgColor = getNodeTypeBackground(NodeType[nodeType]);
        const containerSize = size * 2;

        return (
            <View
                style={[
                    styles.container,
                    {
                        width: containerSize,
                        height: containerSize,
                        borderRadius: containerSize / 4,
                        backgroundColor: bgColor,
                    },
                    style,
                ]}
            >
                <IconComponent size={size} color={iconColor} />
            </View>
        );
    }

    return <IconComponent size={size} color={iconColor} style={style} />;
}

/**
 * Get icon component for a node type
 */
export function getNodeTypeIconComponent(nodeType: NodeType): LucideIcon {
    return nodeTypeIcons[nodeType] || nodeTypeIcons[NodeType.Unknown];
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
