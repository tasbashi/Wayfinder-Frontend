import React, { memo } from "react";
import { Line, Skia } from "@shopify/react-native-skia";
import type { Edge, Node } from "@/types";
import { COLORS } from "@/constants/colors";

interface EdgeLineProps {
    edge: Edge;
    nodes: Map<string, Node>;
    strokeWidth?: number;
    color?: string;
    isPartOfRoute?: boolean;
}

export const EdgeLine: React.FC<EdgeLineProps> = memo(
    ({ edge, nodes, strokeWidth = 1, color, isPartOfRoute = false }) => {
        const fromNode = nodes.get(edge.fromNodeId);
        const toNode = nodes.get(edge.toNodeId);

        if (!fromNode || !toNode) return null;

        const lineColor = isPartOfRoute
            ? COLORS.map.route
            : color || COLORS.map.edge;

        return (
            <Line
                p1={{ x: fromNode.x, y: fromNode.y }}
                p2={{ x: toNode.x, y: toNode.y }}
                color={Skia.Color(lineColor)}
                style="stroke"
                strokeWidth={isPartOfRoute ? strokeWidth * 2 : strokeWidth}
            />
        );
    }
);

EdgeLine.displayName = "EdgeLine";
