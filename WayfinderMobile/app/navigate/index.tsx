import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { ArrowLeft, Navigation } from "lucide-react-native";
import { IconButton } from "@/components/common/IconButton";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { NodeCard } from "@/components/common/NodeCard";
import { SearchInput } from "@/components/common/SearchInput";
import { useNodes } from "@/api/hooks/useNodes";
import { useCalculateRoute } from "@/api/hooks/useRoutes";
import { useLocationStore } from "@/store/useLocationStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { COLORS } from "@/constants/colors";
import type { Node } from "@/types";

export default function NavigateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ startNodeId?: string; endNodeId?: string; type?: string }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectingFor, setSelectingFor] = useState<"start" | "end">("end");
    const [startNode, setStartNode] = useState<Node | null>(null);
    const [endNode, setEndNode] = useState<Node | null>(null);

    const { currentNode } = useLocationStore();
    const { setRoute } = useNavigationStore();
    const { data: nodes, isLoading } = useNodes();
    const calculateRouteMutation = useCalculateRoute();

    // Set initial nodes from params or store
    useEffect(() => {
        if (currentNode) {
            setStartNode(currentNode);
        }
        if (params.endNodeId && nodes) {
            const node = nodes.find((n) => n.id === params.endNodeId);
            if (node) setEndNode(node);
        }
    }, [currentNode, params.endNodeId, nodes]);

    // Filter nodes by search
    const filteredNodes = React.useMemo(() => {
        if (!nodes) return [];
        if (!searchQuery) return nodes;
        return nodes.filter((node) =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [nodes, searchQuery]);

    const handleNodeSelect = (node: Node) => {
        if (selectingFor === "start") {
            setStartNode(node);
        } else {
            setEndNode(node);
        }
        setSearchQuery("");
    };

    const handleCalculateRoute = async () => {
        if (!startNode || !endNode) return;

        try {
            const route = await calculateRouteMutation.mutateAsync({
                startNodeId: startNode.id,
                endNodeId: endNode.id,
            });
            setRoute(route, startNode, endNode);
            router.push(`/navigate/${route.pathNodes[0].id}`);
        } catch (error) {
            console.error("Route calculation failed:", error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "Navigasyon",
                    headerLeft: () => (
                        <IconButton
                            icon={ArrowLeft}
                            variant="ghost"
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />

            {/* Selected Nodes */}
            <View className="px-5 py-4 gap-3">
                {/* Start */}
                <Card
                    variant={selectingFor === "start" ? "outlined" : "default"}
                    className={selectingFor === "start" ? "border-primary-500" : ""}
                    onTouchEnd={() => setSelectingFor("start")}
                >
                    <View className="flex-row items-center gap-3">
                        <View className="w-3 h-3 bg-green-500 rounded-full" />
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500">Başlangıç</Text>
                            <Text className="text-base font-medium text-gray-900">
                                {startNode?.name || "Konum seçin"}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* End */}
                <Card
                    variant={selectingFor === "end" ? "outlined" : "default"}
                    className={selectingFor === "end" ? "border-primary-500" : ""}
                    onTouchEnd={() => setSelectingFor("end")}
                >
                    <View className="flex-row items-center gap-3">
                        <View className="w-3 h-3 bg-red-500 rounded-full" />
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500">Hedef</Text>
                            <Text className="text-base font-medium text-gray-900">
                                {endNode?.name || "Hedef seçin"}
                            </Text>
                        </View>
                    </View>
                </Card>
            </View>

            {/* Search */}
            <View className="px-5 mb-3">
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`${selectingFor === "start" ? "Başlangıç" : "Hedef"} ara...`}
                />
            </View>

            {/* Node List */}
            <FlatList
                data={filteredNodes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, gap: 12 }}
                renderItem={({ item }) => (
                    <NodeCard
                        node={item}
                        onPress={() => handleNodeSelect(item)}
                        selected={item.id === (selectingFor === "start" ? startNode?.id : endNode?.id)}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <Text className="text-center text-gray-500">Sonuç bulunamadı</Text>
                    )
                }
            />

            {/* Calculate Button */}
            <View className="px-5 pb-5">
                <Button
                    fullWidth
                    size="lg"
                    icon={Navigation}
                    disabled={!startNode || !endNode}
                    loading={calculateRouteMutation.isPending}
                    onPress={handleCalculateRoute}
                >
                    Rotayı Hesapla
                </Button>
            </View>
        </SafeAreaView>
    );
}
