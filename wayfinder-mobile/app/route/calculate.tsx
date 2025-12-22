import { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { RouteService } from "@/api/route.service";
import { useBuildingStore } from "@/store/buildingStore";
import { useNodeStore } from "@/store/nodeStore";
import { useRouteStore } from "@/store/routeStore";
import { MapPin, Navigation, CheckCircle, ArrowUpDown, Accessibility, ChevronLeft, RotateCcw, X, AlertTriangle } from "lucide-react-native";
import { getNodeTypeLabel } from "@/utils/nodeTypeUtils";

export default function RouteCalculateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  // Route store for navigation state
  const {
    startNodeId,
    endNodeId,
    selectedBuildingId,
    requireAccessible,
    setStartNode,
    setEndNode,
    setSelectedBuilding,
    setRequireAccessible,
    swapNodes,
    clearRoute,
  } = useRouteStore();

  const { buildings, loadBuildings, isLoading: buildingsLoading } = useBuildingStore();
  const { nodes, fetchNodes, isLoading: nodesLoading } = useNodeStore();

  // Find selected nodes from store
  const startNode = nodes?.items?.find((n) => n.id === startNodeId);
  const endNode = nodes?.items?.find((n) => n.id === endNodeId);

  // Find building for a node
  const getBuildingForNode = (nodeFloorId: string | undefined) => {
    if (!nodeFloorId || !buildings?.items) return null;
    return buildings.items.find((b) =>
      b.floors?.some((f) => f.id === nodeFloorId)
    );
  };

  // Get buildings for selected nodes
  const startNodeBuilding = useMemo(() =>
    getBuildingForNode(startNode?.floorId),
    [startNode?.floorId, buildings]
  );

  const endNodeBuilding = useMemo(() =>
    getBuildingForNode(endNode?.floorId),
    [endNode?.floorId, buildings]
  );

  // Check if nodes are from different buildings
  const isDifferentBuildings = useMemo(() => {
    if (!startNodeBuilding || !endNodeBuilding) return false;
    return startNodeBuilding.id !== endNodeBuilding.id;
  }, [startNodeBuilding, endNodeBuilding]);

  // Reset route state and load data on mount, but preserve navigation params
  useEffect(() => {
    // Read navigation params
    const paramStartNodeId = params.startNodeId as string | undefined;
    const paramEndNodeId = params.endNodeId as string | undefined;
    const paramBuildingId = params.buildingId as string | undefined;

    // Clear previous selections when entering the page
    clearRoute();

    // Apply navigation params if provided
    if (paramStartNodeId) {
      setStartNode(paramStartNodeId);
    }
    if (paramEndNodeId) {
      setEndNode(paramEndNodeId);
    }
    if (paramBuildingId) {
      setSelectedBuilding(paramBuildingId);
    }

    if (!buildings) {
      loadBuildings(1, 100);
    }
    if (!nodes) {
      fetchNodes(1, 1000);
    }
  }, []);

  // Auto-set building based on selected node
  useEffect(() => {
    // If only start node is selected, set building to start node's building
    if (startNodeId && !endNodeId && startNodeBuilding) {
      setSelectedBuilding(startNodeBuilding.id);
    }
    // If only end node is selected, set building to end node's building
    else if (!startNodeId && endNodeId && endNodeBuilding) {
      setSelectedBuilding(endNodeBuilding.id);
    }
    // If no nodes are selected, clear building selection
    else if (!startNodeId && !endNodeId) {
      setSelectedBuilding(null);
    }
    // If both nodes are selected and from same building, set that building
    else if (startNodeId && endNodeId && startNodeBuilding && !isDifferentBuildings) {
      setSelectedBuilding(startNodeBuilding.id);
    }
  }, [startNodeId, endNodeId, startNodeBuilding, endNodeBuilding]);

  // Handle building toggle (select/deselect)
  const handleBuildingToggle = (buildingId: string) => {
    if (selectedBuildingId === buildingId) {
      // Deselect building
      setSelectedBuilding(null);
    } else {
      // Select building
      setSelectedBuilding(buildingId);
    }
  };

  // Reset all selections
  const handleReset = () => {
    clearRoute();
  };

  // Clear start node
  const handleClearStart = () => {
    setStartNode(null);
  };

  // Clear end node
  const handleClearEnd = () => {
    setEndNode(null);
  };

  // Check if any selection is made
  const hasAnySelection = startNodeId || endNodeId || selectedBuildingId;

  const handleCalculateRoute = async () => {
    if (!startNodeId || !endNodeId) {
      Alert.alert(t("common.error"), t("route.selectBothNodes"));
      return;
    }

    if (startNodeId === endNodeId) {
      Alert.alert(t("common.error"), t("route.sameNodeError"));
      return;
    }

    // Warn if different buildings
    if (isDifferentBuildings) {
      Alert.alert(t("common.error"), t("route.differentBuildingsError"));
      return;
    }

    try {
      const result = await RouteService.calculateRoute(
        startNodeId,
        endNodeId,
        requireAccessible,
        selectedBuildingId || undefined
      );

      router.push({
        pathname: "/route/result",
        params: {
          routeData: JSON.stringify(result),
        },
      });
    } catch (error) {
      Alert.alert(
        t("route.routeCalculationFailed"),
        error instanceof Error ? error.message : t("errors.generic")
      );
    }
  };

  const handleSelectStart = () => {
    router.push({
      pathname: "/search",
      params: {
        forDestination: "false",
        buildingId: selectedBuildingId || undefined,
      },
    });
  };

  const handleSelectEnd = () => {
    router.push({
      pathname: "/search",
      params: {
        forDestination: "true",
        buildingId: selectedBuildingId || undefined,
      },
    });
  };

  const handleSwapNodes = () => {
    if (startNodeId || endNodeId) {
      swapNodes();
    }
  };

  const isCalculating = false; // Will use local state if needed

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("route.title")}</Text>
        {hasAnySelection ? (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Different Buildings Warning */}
        {isDifferentBuildings && (
          <View style={styles.warningCard}>
            <AlertTriangle size={20} color="#f59e0b" />
            <Text style={styles.warningText}>{t("route.differentBuildingsWarning")}</Text>
          </View>
        )}

        {/* Building Selection - Only show if no nodes selected */}
        {!startNodeId && !endNodeId && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t("route.selectBuilding")}</Text>
              <Text style={styles.optionalLabel}>{t("route.selectBuildingOptional")}</Text>
            </View>
            <Text style={styles.helpText}>{t("route.selectBuildingHint")}</Text>
            {buildingsLoading ? (
              <View style={styles.buildingLoadingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buildingScroll}>
                {buildings?.items.map((building) => (
                  <TouchableOpacity
                    key={building.id}
                    style={[
                      styles.buildingCard,
                      selectedBuildingId === building.id && styles.buildingCardActive,
                    ]}
                    onPress={() => handleBuildingToggle(building.id)}
                  >
                    <View style={styles.buildingCardContent}>
                      <Text
                        style={[
                          styles.buildingName,
                          selectedBuildingId === building.id && styles.buildingNameActive,
                        ]}
                      >
                        {building.name}
                      </Text>
                      {selectedBuildingId === building.id && (
                        <X size={14} color="#3b82f6" style={styles.deselectIcon} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Location Selection Card */}
        <View style={styles.locationCard}>
          {/* Start Node */}
          <View style={styles.locationRow}>
            <TouchableOpacity style={styles.locationTouchable} onPress={handleSelectStart}>
              <View style={[styles.locationIcon, styles.startIcon]}>
                {startNode ? (
                  <CheckCircle size={20} color="#10b981" />
                ) : (
                  <MapPin size={20} color="#10b981" />
                )}
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{t("route.startLocation")}</Text>
                {startNode ? (
                  <>
                    <Text style={styles.locationName}>{startNode.name}</Text>
                    {startNodeBuilding && (
                      <Text style={styles.locationBuilding}>{startNodeBuilding.name}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.locationPlaceholder}>{t("route.selectStartLocation")}</Text>
                )}
              </View>
            </TouchableOpacity>
            {startNode && (
              <TouchableOpacity style={styles.clearNodeButton} onPress={handleClearStart}>
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <View style={styles.swapLine} />
            <TouchableOpacity
              style={[
                styles.swapButton,
                (!startNodeId && !endNodeId) && styles.swapButtonDisabled
              ]}
              onPress={handleSwapNodes}
              disabled={!startNodeId && !endNodeId}
            >
              <ArrowUpDown size={18} color={startNodeId || endNodeId ? "#3b82f6" : "#9ca3af"} />
            </TouchableOpacity>
            <View style={styles.swapLine} />
          </View>

          {/* End Node */}
          <View style={styles.locationRow}>
            <TouchableOpacity style={styles.locationTouchable} onPress={handleSelectEnd}>
              <View style={[styles.locationIcon, styles.endIcon]}>
                {endNode ? (
                  <CheckCircle size={20} color="#ef4444" />
                ) : (
                  <MapPin size={20} color="#ef4444" />
                )}
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{t("route.destination")}</Text>
                {endNode ? (
                  <>
                    <Text style={styles.locationName}>{endNode.name}</Text>
                    {endNodeBuilding && (
                      <Text style={styles.locationBuilding}>{endNodeBuilding.name}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.locationPlaceholder}>{t("route.selectDestination")}</Text>
                )}
              </View>
            </TouchableOpacity>
            {endNode && (
              <TouchableOpacity style={styles.clearNodeButton} onPress={handleClearEnd}>
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Accessible Route Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleIconContainer}>
            <Accessibility size={24} color="#3b82f6" />
          </View>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{t("route.accessibleRoute")}</Text>
            <Text style={styles.toggleDescription}>{t("route.accessibleRouteHint")}</Text>
          </View>
          <Switch
            value={requireAccessible}
            onValueChange={setRequireAccessible}
            trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
            thumbColor={requireAccessible ? "#3b82f6" : "#f3f4f6"}
          />
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            (!startNodeId || !endNodeId || isCalculating || isDifferentBuildings) && styles.calculateButtonDisabled,
          ]}
          onPress={handleCalculateRoute}
          disabled={!startNodeId || !endNodeId || isCalculating || isDifferentBuildings}
        >
          {isCalculating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Navigation size={22} color="#fff" />
              <Text style={styles.calculateButtonText}>{t("route.calculateRoute")}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  optionalLabel: {
    fontSize: 14,
    color: "#9ca3af",
  },
  helpText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  buildingLoadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buildingScroll: {
    marginBottom: 8,
  },
  buildingCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  buildingCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  buildingCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buildingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  buildingNameActive: {
    color: "#3b82f6",
  },
  deselectIcon: {
    marginLeft: 4,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  locationTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  startIcon: {
    backgroundColor: "#d1fae5",
  },
  endIcon: {
    backgroundColor: "#fee2e2",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  locationBuilding: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  locationPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  clearNodeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  swapContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  swapButtonDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    gap: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calculateButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
