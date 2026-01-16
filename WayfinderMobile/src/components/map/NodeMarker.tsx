import React, { memo } from "react";
import { Circle, Group, Path, Skia } from "@shopify/react-native-skia";
import type { Node } from "@/types";
import { getNodeTypeConfig } from "@/constants/nodeTypes";
import { COLORS } from "@/constants/colors";

interface NodeMarkerProps {
    node: Node;
    size?: number;
    isSelected?: boolean;
    isCurrentLocation?: boolean;
    isDestination?: boolean;
}

export const NodeMarker: React.FC<NodeMarkerProps> = memo(
    ({ node, size = 12, isSelected = false, isCurrentLocation = false, isDestination = false }) => {
        const config = getNodeTypeConfig(node.type);

        // Determine color based on state
        let fillColor = config.color;
        let strokeColor = COLORS.white;
        let strokeWidth = 2;

        if (isCurrentLocation) {
            fillColor = COLORS.map.currentLocation;
            strokeWidth = 3;
        } else if (isDestination) {
            fillColor = COLORS.map.destination;
            strokeWidth = 3;
        } else if (isSelected) {
            fillColor = COLORS.map.nodeHighlight;
            strokeWidth = 3;
        }

        return (
            <Group>
                {/* Outer glow for special markers */}
                {(isCurrentLocation || isDestination) && (
                    <Circle
                        cx={node.x}
                        cy={node.y}
                        r={size + 6}
                        color={Skia.Color(`${fillColor}40`)}
                    />
                )}
                {/* Main marker */}
                <Circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    color={Skia.Color(fillColor)}
                />
                {/* Border */}
                <Circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    color={Skia.Color(strokeColor)}
                />
            </Group>
        );
    }
);

NodeMarker.displayName = "NodeMarker";
