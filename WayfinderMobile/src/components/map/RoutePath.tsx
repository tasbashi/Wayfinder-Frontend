import React, { memo, useMemo } from "react";
import { Path, Skia, DashPathEffect } from "@shopify/react-native-skia";
import type { Node } from "@/types";
import { COLORS } from "@/constants/colors";
import { APP_CONFIG } from "@/config/app.config";

interface RoutePathProps {
    pathNodes: Node[];
    strokeWidth?: number;
    color?: string;
    animated?: boolean;
}

export const RoutePath: React.FC<RoutePathProps> = memo(
    ({
        pathNodes,
        strokeWidth = APP_CONFIG.map.routeLineWidth,
        color = COLORS.map.routeActive,
        animated = true,
    }) => {
        // Create path string from nodes
        const pathString = useMemo(() => {
            if (pathNodes.length < 2) return "";

            let d = `M ${pathNodes[0].x} ${pathNodes[0].y}`;
            for (let i = 1; i < pathNodes.length; i++) {
                d += ` L ${pathNodes[i].x} ${pathNodes[i].y}`;
            }
            return d;
        }, [pathNodes]);

        const path = useMemo(() => {
            if (!pathString) return null;
            return Skia.Path.MakeFromSVGString(pathString);
        }, [pathString]);

        if (!path) return null;

        return (
            <>
                {/* Background path (shadow) */}
                <Path
                    path={path}
                    color={Skia.Color(`${color}40`)}
                    style="stroke"
                    strokeWidth={strokeWidth + 4}
                    strokeCap="round"
                    strokeJoin="round"
                />
                {/* Main path */}
                <Path
                    path={path}
                    color={Skia.Color(color)}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                    strokeJoin="round"
                >
                    {animated && (
                        <DashPathEffect intervals={[10, 5]} phase={0} />
                    )}
                </Path>
            </>
        );
    }
);

RoutePath.displayName = "RoutePath";
