import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { Canvas, Group, Image, useImage } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { NodeMarker } from "./NodeMarker";
import { EdgeLine } from "./EdgeLine";
import { RoutePath } from "./RoutePath";
import { useMapGestures } from "@/hooks/useMapGestures";
import type { Node, Edge, PathResult } from "@/types";
import { cn } from "@/utils/cn";

interface MapCanvasProps {
    nodes: Node[];
    edges: Edge[];
    floorPlanUrl?: string;
    activeRoute?: PathResult | null;
    currentLocationId?: string | null;
    destinationId?: string | null;
    onNodePress?: (node: Node) => void;
    showEdges?: boolean;
    showNodes?: boolean;
    className?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
    nodes,
    edges,
    floorPlanUrl,
    activeRoute,
    currentLocationId,
    destinationId,
    onNodePress,
    showEdges = false,
    showNodes = true,
    className,
}) => {
    const { width, height } = useWindowDimensions();
    const floorPlanImage = useImage(floorPlanUrl ?? null);

    const { gesture, scale, translateX, translateY } = useMapGestures();

    // Create node map for quick lookup
    const nodeMap = useMemo(() => {
        const map = new Map<string, Node>();
        nodes.forEach((node) => map.set(node.id, node));
        return map;
    }, [nodes]);

    // Animated transform style
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <View className={cn("flex-1 bg-gray-100", className)}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                    <Canvas style={{ width, height }}>
                        <Group>
                            {/* Floor Plan Image */}
                            {floorPlanImage && (
                                <Image
                                    image={floorPlanImage}
                                    fit="contain"
                                    x={0}
                                    y={0}
                                    width={width}
                                    height={height}
                                />
                            )}

                            {/* Edges */}
                            {showEdges &&
                                edges.map((edge) => (
                                    <EdgeLine
                                        key={edge.id}
                                        edge={edge}
                                        nodes={nodeMap}
                                    />
                                ))}

                            {/* Active Route */}
                            {activeRoute && activeRoute.pathNodes.length > 1 && (
                                <RoutePath pathNodes={activeRoute.pathNodes} />
                            )}

                            {/* Nodes */}
                            {showNodes &&
                                nodes.map((node) => (
                                    <NodeMarker
                                        key={node.id}
                                        node={node}
                                        isCurrentLocation={node.id === currentLocationId}
                                        isDestination={node.id === destinationId}
                                    />
                                ))}
                        </Group>
                    </Canvas>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};
