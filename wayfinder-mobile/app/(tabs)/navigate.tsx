import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useBuildingStore } from "@/store/buildingStore";
import { BuildingDto } from "@/types/building.types";
import {
    Building,
    ChevronRight,
    Accessibility,
} from "lucide-react-native";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function NavigateTab() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();
    const { buildings, isLoading, error, loadBuildings } = useBuildingStore();
    const [requireAccessible, setRequireAccessible] = useState(false);

    useEffect(() => {
        loadBuildings(1, 20);
    }, []);

    function handleBuildingSelect(building: BuildingDto) {
        // Go directly to route calculation with the selected building
        router.push({
            pathname: "/route/calculate",
            params: { buildingId: building.id },
        });
    }

    function renderBuildingItem({ item }: { item: BuildingDto }) {
        const floorCount = item.floors?.length || 0;

        return (
            <TouchableOpacity
                style={styles.buildingCard}
                onPress={() => handleBuildingSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.buildingIcon}>
                    <Building size={24} color="#3b82f6" />
                </View>
                <View style={styles.buildingInfo}>
                    <Text style={[styles.buildingName, { fontSize: 16 * fontSizeMultiplier }]}>
                        {item.name}
                    </Text>
                    {item.address && (
                        <Text style={[styles.buildingAddress, { fontSize: 14 * fontSizeMultiplier }]}>
                            {item.address}
                        </Text>
                    )}
                    <Text style={[styles.floorCount, { fontSize: 12 * fontSizeMultiplier }]}>
                        {floorCount} {floorCount === 1 ? "floor" : "floors"}
                    </Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { fontSize: 28 * fontSizeMultiplier }]}>
                    {t("navigate.title")}
                </Text>
                <Text style={[styles.subtitle, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("navigate.selectBuilding")}
                </Text>
            </View>

            {/* Accessibility Toggle */}
            <View style={styles.accessibilityRow}>
                <View style={styles.accessibilityInfo}>
                    <Accessibility
                        size={20}
                        color={requireAccessible ? "#3b82f6" : "#6b7280"}
                    />
                    <Text style={[styles.accessibilityText, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t("navigate.accessibleRoute")}
                    </Text>
                </View>
                <Switch
                    value={requireAccessible}
                    onValueChange={setRequireAccessible}
                    trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                    thumbColor={requireAccessible ? "#3b82f6" : "#f4f3f4"}
                />
            </View>

            {/* Content */}
            {isLoading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>{t("common.loading")}</Text>
                </View>
            )}

            {error && (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadBuildings(1, 20)}>
                        <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoading && !error && buildings?.items && (
                <FlatList
                    data={buildings.items}
                    renderItem={renderBuildingItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Building size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>{t("navigate.noBuildings")}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
    },
    accessibilityRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    accessibilityInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    accessibilityText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6b7280",
    },
    errorText: {
        fontSize: 16,
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    buildingCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    buildingIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    buildingInfo: {
        flex: 1,
    },
    buildingName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    buildingAddress: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 4,
    },
    floorCount: {
        fontSize: 12,
        color: "#9ca3af",
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
    },
});
