/**
 * RoutePathOverlay
 * 
 * SVG overlay that draws the navigation route on the floor plan.
 * Features gradient line with glow effect and direction indicators.
 */

import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { PathPointDto } from '@/api/types';
import { theme } from '@/theme';

interface RoutePathOverlayProps {
    /** Array of path points to draw */
    points: PathPointDto[];
    /** Width of the floor plan container */
    width: number;
    /** Height of the floor plan container */
    height: number;
    /** Stroke width of the path */
    strokeWidth?: number;
    /** Current step index (for highlighting progress) */
    currentStepIndex?: number;
    /** Total number of steps */
    totalSteps?: number;
    /** Show direction arrows on path */
    showArrows?: boolean;
}

export function RoutePathOverlay({
    points,
    width,
    height,
    strokeWidth = 6,
    currentStepIndex = 0,
    totalSteps = 1,
    showArrows = true,
}: RoutePathOverlayProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Generate SVG path data from points
    const pathData = useMemo(() => {
        if (points.length < 2) return '';

        // Create smooth bezier curve through points
        const path: string[] = [];
        path.push(`M ${points[0].x} ${points[0].y}`);

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];

            // Simple line for now, can enhance with curves later
            path.push(`L ${curr.x} ${curr.y}`);
        }

        return path.join(' ');
    }, [points]);

    // Calculate arrow positions along the path
    const arrowPositions = useMemo(() => {
        if (!showArrows || points.length < 3) return [];

        const arrows: { x: number; y: number; angle: number }[] = [];

        // Place arrows at regular intervals
        const interval = Math.max(3, Math.floor(points.length / 5));

        for (let i = interval; i < points.length - 1; i += interval) {
            const prev = points[i - 1];
            const curr = points[i];

            // Calculate angle for arrow direction
            const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x) * (180 / Math.PI);

            arrows.push({
                x: curr.x,
                y: curr.y,
                angle,
            });
        }

        return arrows;
    }, [points, showArrows]);

    // Progress calculation (for future gradient use)
    const progressRatio = totalSteps > 0 ? currentStepIndex / totalSteps : 0;

    if (points.length < 2) {
        return null;
    }

    const primaryColor = theme.colors.primary[500];
    const primaryLight = isDark ? theme.colors.primary[400] : theme.colors.primary[300];

    return (
        <Svg
            width={width}
            height={height}
            style={{ position: 'absolute', top: 0, left: 0 }}
        >
            <Defs>
                {/* Gradient for path */}
                <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={primaryLight} stopOpacity={0.3} />
                    <Stop offset={`${progressRatio * 100}%`} stopColor={primaryColor} stopOpacity={1} />
                    <Stop offset="100%" stopColor={primaryColor} stopOpacity={0.7} />
                </LinearGradient>
            </Defs>

            {/* Glow effect (wider stroke behind) */}
            <Path
                d={pathData}
                stroke={primaryColor}
                strokeWidth={strokeWidth * 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.2}
            />

            {/* Main route path */}
            <Path
                d={pathData}
                stroke="url(#routeGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Direction dots/arrows */}
            {arrowPositions.map((arrow, index) => (
                <Circle
                    key={`arrow-${index}`}
                    cx={arrow.x}
                    cy={arrow.y}
                    r={strokeWidth * 0.6}
                    fill="#ffffff"
                    opacity={0.9}
                />
            ))}

            {/* End point indicator */}
            {points.length > 0 && (
                <Circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={strokeWidth * 1.5}
                    fill={theme.colors.success[500]}
                    stroke="#ffffff"
                    strokeWidth={2}
                />
            )}
        </Svg>
    );
}
