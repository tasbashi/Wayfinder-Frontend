import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated, Easing } from "react-native";
import Svg, {
    Path,
    Circle,
    Defs,
    LinearGradient,
    Stop,
    G,
    Polygon,
    Rect,
    Text as SvgText,
} from "react-native-svg";
import { RouteNodeDto } from "@/types/route.types";


interface RoutePathOverlayProps {
    floorRoutePath: RouteNodeDto[];
    currentStep: RouteNodeDto | null;
    imageSize: { width: number; height: number };
    displaySize: { width: number; height: number };
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function RoutePathOverlay({
    floorRoutePath,
    currentStep,
    imageSize,
    displaySize,
}: RoutePathOverlayProps) {
    // Animation for current position pulse
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const pulseOpacity = useRef(new Animated.Value(0.6)).current;

    // Animation for flowing path effect
    const dashOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Create pulsing animation for current position
        const pulseAnimation = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.8,
                        duration: 1000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(pulseOpacity, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseOpacity, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                ]),
            ])
        );
        pulseAnimation.start();

        // Create flowing dash animation for path
        const dashAnimation = Animated.loop(
            Animated.timing(dashOffset, {
                toValue: -30, // Negative value for forward flow
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        );
        dashAnimation.start();

        return () => {
            pulseAnimation.stop();
            dashAnimation.stop();
        };
    }, []);

    if (floorRoutePath.length < 1 || imageSize.width === 0) {
        return null;
    }

    // Generate SVG path for route, using corridor path points when available
    // Uses smooth curves for a better user experience
    const generateRoutePath = () => {
        if (floorRoutePath.length < 2) return null;

        // Build array of all points including corridor intermediate points
        const rawPoints: { x: number; y: number }[] = [];

        for (let i = 0; i < floorRoutePath.length; i++) {
            const node = floorRoutePath[i];
            const isFirst = i === 0;
            const isLast = i === floorRoutePath.length - 1;

            // First node (start) - always add its position
            if (isFirst) {
                rawPoints.push({ x: node.x, y: node.y });
                // If it also has corridor points (shouldn't normally), add them after
                if (node.corridorPathPoints && node.corridorPathPoints.length > 0) {
                    for (const pt of node.corridorPathPoints) {
                        rawPoints.push({ x: pt.x, y: pt.y });
                    }
                }
            }
            // Last node (end) - always add its position at the end
            else if (isLast) {
                // If it has corridor points, add them first
                if (node.corridorPathPoints && node.corridorPathPoints.length > 0) {
                    for (const pt of node.corridorPathPoints) {
                        rawPoints.push({ x: pt.x, y: pt.y });
                    }
                }
                // Then add the node position
                rawPoints.push({ x: node.x, y: node.y });
            }
            // Middle nodes (corridors) - add corridor points if available
            else if (node.corridorPathPoints && node.corridorPathPoints.length > 0) {
                for (const pt of node.corridorPathPoints) {
                    rawPoints.push({ x: pt.x, y: pt.y });
                }
            } else {
                // Regular middle node - add its position
                rawPoints.push({ x: node.x, y: node.y });
            }
        }

        if (rawPoints.length < 2) return null;

        // Optimize points: remove duplicates and very close points
        const allPoints: { x: number; y: number }[] = [rawPoints[0]];
        const minDistance = 5; // Minimum distance between points

        for (let i = 1; i < rawPoints.length; i++) {
            const curr = rawPoints[i];
            const prev = allPoints[allPoints.length - 1];
            const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));

            if (dist >= minDistance) {
                allPoints.push(curr);
            }
        }

        // Ensure we always have the final destination
        const lastRaw = rawPoints[rawPoints.length - 1];
        const lastPoint = allPoints[allPoints.length - 1];
        if (lastRaw.x !== lastPoint.x || lastRaw.y !== lastPoint.y) {
            allPoints.push(lastRaw);
        }

        if (allPoints.length < 2) return null;

        // Generate path using straight line segments
        // (Bezier curves cut corners and don't pass through all points)
        let path = `M ${allPoints[0].x} ${allPoints[0].y}`;

        for (let i = 1; i < allPoints.length; i++) {
            path += ` L ${allPoints[i].x} ${allPoints[i].y}`;
        }

        return path;
    };

    // Generate direction arrows along the path
    const generateArrows = () => {
        const arrows: { x: number; y: number; angle: number }[] = [];

        for (let i = 0; i < floorRoutePath.length - 1; i++) {
            const curr = floorRoutePath[i];
            const next = floorRoutePath[i + 1];

            // Calculate midpoint for arrow
            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;

            // Calculate angle
            const angle = Math.atan2(next.y - curr.y, next.x - curr.x) * (180 / Math.PI);

            arrows.push({ x: midX, y: midY, angle });
        }

        return arrows;
    };

    const routePathSvg = generateRoutePath();
    const arrows = generateArrows();

    // Calculate viewBox to match image coordinates
    const viewBox = `0 0 ${imageSize.width} ${imageSize.height}`;

    return (
        <View style={StyleSheet.absoluteFill}>
            <Svg
                width={displaySize.width}
                height={displaySize.height}
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
            >
                <Defs>
                    {/* Gradient for route path */}
                    <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                    </LinearGradient>

                    {/* Glow effect for path */}
                    <LinearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <Stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>

                {/* Route path glow (shadow effect) */}
                {routePathSvg && (
                    <Path
                        d={routePathSvg}
                        stroke="url(#routeGlow)"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Main route path */}
                {routePathSvg && (
                    <Path
                        d={routePathSvg}
                        stroke="url(#routeGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Animated flowing dashes overlay */}
                {routePathSvg && (
                    <AnimatedPath
                        d={routePathSvg}
                        stroke="#ffffff"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="10 20"
                        strokeDashoffset={dashOffset}
                        opacity={0.7}
                    />
                )}

                {/* Direction arrows */}
                {arrows.map((arrow, index) => (
                    <G
                        key={`arrow-${index}`}
                        transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}
                    >
                        <Polygon
                            points="0,-4 8,0 0,4"
                            fill="#fff"
                            stroke="#3b82f6"
                            strokeWidth="0.5"
                        />
                    </G>
                ))}

                {/* Route nodes */}
                {floorRoutePath.map((node, index) => {
                    const isCurrent = node.nodeId === currentStep?.nodeId;
                    const isStart = index === 0;
                    const isEnd = index === floorRoutePath.length - 1;
                    const isCorridor = node.nodeType === 1; // NodeType.Corridor = 1

                    // Determine node styling - smaller sizes for cleaner appearance
                    let fillColor = "#3b82f6";
                    let strokeColor = "#fff";
                    let radius = 8; // Base radius reduced from 12
                    let showMarker = true;

                    if (isCurrent) {
                        fillColor = "#f59e0b";
                        radius = 10; // Current position radius reduced from 16
                    } else if (isStart) {
                        fillColor = "#10b981";
                        radius = 9; // Start radius reduced from 14
                    } else if (isEnd) {
                        fillColor = "#ef4444";
                        radius = 9; // End radius reduced from 14
                    } else if (isCorridor) {
                        // Corridor nodes: smaller purple markers, but hide intermediate ones
                        fillColor = "#8b5cf6"; // Purple for corridor
                        radius = 4; // Corridor radius reduced from 6

                        // Check if this is an intermediate corridor node (between two other corridor nodes)
                        const prevIsCorridor = index > 0 && floorRoutePath[index - 1].nodeType === 1;
                        const nextIsCorridor = index < floorRoutePath.length - 1 && floorRoutePath[index + 1].nodeType === 1;

                        // Hide intermediate corridor markers for smoother path appearance
                        if (prevIsCorridor && nextIsCorridor) {
                            showMarker = false;
                        }
                    }

                    if (!showMarker) return null;

                    return (
                        <G key={node.nodeId}>
                            {/* Outer glow for current position */}
                            {isCurrent && (
                                <Circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={radius * 2}
                                    fill="#f59e0b"
                                    fillOpacity={0.2}
                                />
                            )}

                            {/* Node background circle */}
                            <Circle
                                cx={node.x}
                                cy={node.y}
                                r={radius + 2}
                                fill={strokeColor}
                                stroke={fillColor}
                                strokeWidth="1.5"
                            />

                            {/* Node main circle */}
                            <Circle
                                cx={node.x}
                                cy={node.y}
                                r={radius}
                                fill={fillColor}
                            />

                            {/* Node icon indicator */}
                            {isStart && (
                                <SvgText
                                    x={node.x}
                                    y={node.y + 5}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fontWeight="bold"
                                    fill="#fff"
                                >
                                    S
                                </SvgText>
                            )}
                            {isEnd && (
                                <SvgText
                                    x={node.x}
                                    y={node.y + 5}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fontWeight="bold"
                                    fill="#fff"
                                >
                                    E
                                </SvgText>
                            )}
                            {isCurrent && !isStart && !isEnd && (
                                <SvgText
                                    x={node.x}
                                    y={node.y + 5}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fontWeight="bold"
                                    fill="#fff"
                                >
                                    ▶
                                </SvgText>
                            )}
                            {!isCurrent && !isStart && !isEnd && (
                                <SvgText
                                    x={node.x}
                                    y={node.y + 4}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill="#fff"
                                >
                                    {index + 1}
                                </SvgText>
                            )}

                            {/* Node label for important nodes */}
                            {(isStart || isEnd || isCurrent) && node.name && (
                                <G>
                                    <Rect
                                        x={node.x - 40}
                                        y={node.y - radius - 28}
                                        width={80}
                                        height={20}
                                        rx={10}
                                        fill="rgba(0,0,0,0.7)"
                                    />
                                    <SvgText
                                        x={node.x}
                                        y={node.y - radius - 14}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="600"
                                        fill="#fff"
                                    >
                                        {(node.name || "").length > 12
                                            ? (node.name || "").slice(0, 10) + "..."
                                            : node.name}
                                    </SvgText>
                                </G>
                            )}
                        </G>
                    );
                })}
            </Svg>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#10b981" }]}>
                        <Text style={styles.legendDotText}>S</Text>
                    </View>
                    <Text style={styles.legendText}>Start</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]}>
                        <Text style={styles.legendDotText}>▶</Text>
                    </View>
                    <Text style={styles.legendText}>Current</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]}>
                        <Text style={styles.legendDotText}>E</Text>
                    </View>
                    <Text style={styles.legendText}>End</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    legend: {
        position: "absolute",
        bottom: 12,
        left: 12,
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    legendDotText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#fff",
    },
    legendText: {
        fontSize: 12,
        color: "#374151",
        fontWeight: "500",
    },
});
