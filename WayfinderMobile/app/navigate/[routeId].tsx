import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { IconButton } from "@/components/common/IconButton";
import { Button } from "@/components/common/Button";
import { TurnByTurnCard } from "@/components/navigation/TurnByTurnCard";
import { RouteInfoCard } from "@/components/navigation/RouteInfoCard";
import { MapCanvas } from "@/components/map/MapCanvas";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useNodesByFloor } from "@/api/hooks/useNodes";
import { useEdgesByFloor } from "@/api/hooks/useEdges";
import { COLORS } from "@/constants/colors";

export default function ActiveNavigationScreen() {
    const router = useRouter();
    const {
        activeRoute,
        currentNodeIndex,
        startNode,
        endNode,
        nextStep,
        previousStep,
        clearRoute,
    } = useNavigationStore();

    // Get nodes and edges for map
    const currentPathNode = activeRoute?.pathNodes[currentNodeIndex];
    const { data: nodes = [] } = useNodesByFloor(currentPathNode?.floorId);
    const { data: edges = [] } = useEdgesByFloor(currentPathNode?.floorId);

    const handleEndNavigation = () => {
        clearRoute();
        router.replace("/(tabs)");
    };

    if (!activeRoute || !startNode || !endNode) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <Text className="text-gray-500">Aktif rota bulunamadı</Text>
                <Button variant="secondary" onPress={() => router.back()} className="mt-4">
                    Geri Dön
                </Button>
            </SafeAreaView>
        );
    }

    const currentNode = activeRoute.pathNodes[currentNodeIndex];
    const nextNode = activeRoute.pathNodes[currentNodeIndex + 1] || null;
    const isFirstStep = currentNodeIndex === 0;
    const isLastStep = currentNodeIndex === activeRoute.pathNodes.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "Navigasyon",
                    headerRight: () => (
                        <Pressable onPress={handleEndNavigation} className="p-2">
                            <X size={24} color={COLORS.gray[600]} />
                        </Pressable>
                    ),
                }}
            />

            {/* Map */}
            <View className="flex-1">
                <MapCanvas
                    nodes={nodes}
                    edges={edges}
                    activeRoute={activeRoute}
                    currentLocationId={currentNode.id}
                    destinationId={endNode.id}
                />
            </View>

            {/* Bottom Panel */}
            <View className="bg-white rounded-t-3xl shadow-lg pt-4 pb-6 px-5">
                {/* Route Info */}
                <RouteInfoCard route={activeRoute} className="mb-4" />

                {/* Turn by Turn */}
                <TurnByTurnCard
                    currentNode={currentNode}
                    nextNode={nextNode}
                    stepNumber={currentNodeIndex + 1}
                    totalSteps={activeRoute.pathNodes.length}
                    className="mb-4"
                />

                {/* Navigation Controls */}
                <View className="flex-row gap-3">
                    <IconButton
                        icon={ChevronLeft}
                        size="lg"
                        variant="default"
                        disabled={isFirstStep}
                        onPress={previousStep}
                    />
                    <View className="flex-1">
                        {isLastStep ? (
                            <Button fullWidth size="lg" onPress={handleEndNavigation}>
                                Navigasyonu Bitir
                            </Button>
                        ) : (
                            <Button fullWidth size="lg" icon={ChevronRight} iconPosition="right" onPress={nextStep}>
                                Sonraki Adım
                            </Button>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
