import React, { useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SearchInput } from "@/components/common/SearchInput";
import { NodeCard } from "@/components/common/NodeCard";
import { FloorSelector } from "@/components/common/FloorSelector";
import { ListItemSkeleton } from "@/components/common/Skeleton";
import { useBuildings } from "@/api/hooks/useBuildings";
import { useFloorsByBuilding } from "@/api/hooks/useFloors";
import { useNodesByFloor } from "@/api/hooks/useNodes";
import type { Node, Floor } from "@/types";

export default function ExploreScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

    // Fetch buildings
    const { data: buildings, isLoading: loadingBuildings } = useBuildings();
    const firstBuilding = buildings?.[0];

    // Fetch floors for first building
    const { data: floors, isLoading: loadingFloors } = useFloorsByBuilding(firstBuilding?.id);

    // Fetch nodes for selected floor
    const { data: nodes, isLoading: loadingNodes } = useNodesByFloor(
        selectedFloor?.id ?? floors?.[0]?.id
    );

    // Filter nodes by search query
    const filteredNodes = React.useMemo(() => {
        if (!nodes) return [];
        if (!searchQuery) return nodes;
        return nodes.filter((node) =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [nodes, searchQuery]);

    const handleNodePress = (node: Node) => {
        router.push(`/navigate?endNodeId=${node.id}`);
    };

    const handleFloorSelect = (floor: Floor) => {
        setSelectedFloor(floor);
    };

    const isLoading = loadingBuildings || loadingFloors || loadingNodes;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-4 pb-2">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Keşfet</Text>
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Oda veya konum ara..."
                />
            </View>

            {/* Floor Selector */}
            {floors && floors.length > 0 && (
                <View className="px-5 py-3">
                    <FloorSelector
                        floors={floors}
                        selectedFloorId={selectedFloor?.id ?? floors[0]?.id ?? null}
                        onSelectFloor={handleFloorSelect}
                    />
                </View>
            )}

            {/* Nodes List */}
            {isLoading ? (
                <View className="px-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </View>
            ) : (
                <FlatList
                    data={filteredNodes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, gap: 12 }}
                    renderItem={({ item }) => (
                        <NodeCard node={item} onPress={() => handleNodePress(item)} />
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-500">Sonuç bulunamadı</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
