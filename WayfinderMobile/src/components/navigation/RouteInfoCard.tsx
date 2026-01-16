import React from "react";
import { View, Text } from "react-native";
import { Card } from "../common/Card";
import { formatDistance, formatTime } from "@/utils/formatters";
import { Navigation, Clock, Footprints } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import type { PathResult } from "@/types";

interface RouteInfoCardProps {
    route: PathResult;
    className?: string;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({ route, className }) => {
    return (
        <Card variant="elevated" className={className}>
            <View className="flex-row justify-around">
                {/* Distance */}
                <View className="items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-1">
                        <Navigation size={20} color={COLORS.info} />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                        {formatDistance(route.totalDistance)}
                    </Text>
                    <Text className="text-xs text-gray-500">Mesafe</Text>
                </View>

                {/* Time */}
                <View className="items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-1">
                        <Clock size={20} color={COLORS.success} />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                        {formatTime(route.estimatedTimeMinutes)}
                    </Text>
                    <Text className="text-xs text-gray-500">Süre</Text>
                </View>

                {/* Steps */}
                <View className="items-center">
                    <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-1">
                        <Footprints size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">
                        {route.pathNodes.length}
                    </Text>
                    <Text className="text-xs text-gray-500">Adım</Text>
                </View>
            </View>
        </Card>
    );
};
