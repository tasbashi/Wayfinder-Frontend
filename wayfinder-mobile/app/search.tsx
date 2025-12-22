import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/useDebounce";
import { NodeService } from "@/api/node.service";
import { NodeDto } from "@/types/node.types";
import { Search, MapPin, Navigation, Heart, HeartOff, ChevronLeft } from "lucide-react-native";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { Storage } from "@/utils/storage";
import { useBuildingStore } from "@/store/buildingStore";
import { useRouteStore } from "@/store/routeStore";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nodes, setNodes] = useState<NodeDto[]>([]);
  const [allNodes, setAllNodes] = useState<NodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteNodeIds, setFavoriteNodeIds] = useState<Set<string>>(new Set());

  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const isForDestination = params.forDestination === "true";
  const buildingIdFilter = params.buildingId as string | undefined;

  const { buildings } = useBuildingStore();
  const { setStartNode, setEndNode, selectedBuildingId } = useRouteStore();

  // Use store's building ID if not provided in params
  const effectiveBuildingId = buildingIdFilter || selectedBuildingId;

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadFavoriteIds();
    // Load all nodes for selected building
    if (effectiveBuildingId) {
      loadBuildingNodes(effectiveBuildingId);
    }
  }, [effectiveBuildingId]);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      performSearch(debouncedSearch);
    } else if (effectiveBuildingId && allNodes.length > 0) {
      // Show all nodes for selected building (sorted)
      setNodes(sortNodes(allNodes));
    } else {
      setNodes([]);
    }
  }, [debouncedSearch, allNodes]);

  async function loadBuildingNodes(buildingId: string) {
    try {
      setIsLoading(true);
      setError(null);

      const building = buildings?.items.find((b) => b.id === buildingId);
      if (!building) {
        setError(t("buildings.noBuildings"));
        return;
      }

      // Load nodes for all floors in this building
      const floorIds = building.floors?.map((f) => f.id) || [];
      const allNodePromises = floorIds.map((floorId) => NodeService.getByFloor(floorId));
      const nodeArrays = await Promise.all(allNodePromises);
      const allLoadedNodes = nodeArrays.flat();

      const sorted = sortNodes(allLoadedNodes);
      setAllNodes(sorted);
      setNodes(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setAllNodes([]);
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function performSearch(query: string) {
    try {
      setIsLoading(true);
      setError(null);
      const results = await NodeService.search(query, effectiveBuildingId || undefined);
      setNodes(sortNodes(results));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }

  function sortNodes(nodesToSort: NodeDto[]): NodeDto[] {
    return [...nodesToSort].sort((a, b) => {
      // Sort by name alphabetically
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";

      // Try to extract room numbers for better sorting
      const numA = extractRoomNumber(nameA);
      const numB = extractRoomNumber(nameB);

      if (numA !== null && numB !== null) {
        return numA - numB;
      }

      return nameA.localeCompare(nameB);
    });
  }

  function extractRoomNumber(name: string): number | null {
    // Extract number from strings like "Room 101", "101", "R-101", etc.
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  async function loadFavoriteIds() {
    try {
      const favorites = await Storage.getFavorites();
      setFavoriteNodeIds(new Set(favorites.map((f) => f.nodeId)));
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }

  async function handleToggleFavorite(node: NodeDto) {
    try {
      const isFavorite = favoriteNodeIds.has(node.id);

      // Find building and floor info
      const building = buildings?.items.find((b) =>
        b.floors?.some((f) => f.id === node.floorId)
      );
      const floor = building?.floors?.find((f) => f.id === node.floorId);

      if (isFavorite) {
        await Storage.removeFavorite(node.id);
      } else {
        await Storage.addFavorite({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: typeof node.nodeType === 'string' ? node.nodeType : String(node.nodeType),
          buildingId: building?.id,
          buildingName: building?.name,
          floorId: node.floorId,
          floorName: floor?.name,
        });
      }

      await loadFavoriteIds();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  async function handleNodeSelect(node: NodeDto) {
    // Add to recent searches
    try {
      const building = buildings?.items.find((b) =>
        b.floors?.some((f) => f.id === node.floorId)
      );
      const floor = building?.floors?.find((f) => f.id === node.floorId);

      await Storage.addRecentSearch({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: typeof node.nodeType === 'string' ? node.nodeType : String(node.nodeType),
        buildingId: building?.id,
        buildingName: building?.name,
        floorId: node.floorId,
        floorName: floor?.name,
      });
    } catch (error) {
      console.error("Error adding recent search:", error);
    }

    // Update store with selected node
    if (isForDestination) {
      setEndNode(node.id);
    } else {
      setStartNode(node.id);
    }

    // Navigate back to calculate screen (clean stack!)
    router.back();
  }

  function renderNodeItem({ item }: { item: NodeDto }) {
    const nodeTypeInfo = getNodeTypeInfo(item.nodeType);
    const Icon = nodeTypeInfo?.icon || MapPin; // Fallback to MapPin if icon is undefined
    const isFavorite = favoriteNodeIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.nodeCard}
        onPress={() => handleNodeSelect(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: nodeTypeInfo?.bgColor || "#f3f4f6" }]}>
          <Icon size={24} color={nodeTypeInfo?.color || "#6b7280"} />
        </View>
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeName}>{item.name}</Text>
          <Text style={styles.nodeType}>{nodeTypeInfo?.label || "Unknown"}</Text>
          {item.qrCode && (
            <Text style={styles.qrCode}>QR: {item.qrCode}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(item);
            }}
          >
            {isFavorite ? (
              <Heart size={20} color="#ef4444" fill="#ef4444" />
            ) : (
              <HeartOff size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
          <Navigation size={20} color="#3b82f6" />
        </View>
      </TouchableOpacity>
    );
  }

  const building = effectiveBuildingId
    ? buildings?.items.find((b) => b.id === effectiveBuildingId)
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isForDestination ? t("route.destination") : t("route.startLocation")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        {building && (
          <View style={styles.buildingInfo}>
            <Text style={styles.buildingLabel}>{t("search.searchingIn")}</Text>
            <Text style={styles.buildingName}>{building.name}</Text>
          </View>
        )}
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={building ? t("search.placeholder") : t("search.placeholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
        </View>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{t("search.searching")}</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!isLoading && !error && searchQuery.length >= 2 && nodes.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t("common.noResults")}</Text>
        </View>
      )}

      {!isLoading && !error && searchQuery.length < 2 && nodes.length === 0 && (
        <View style={styles.center}>
          <Search size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {building
              ? t("search.allLocations")
              : t("search.typeToSearch")}
          </Text>
        </View>
      )}

      {nodes.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {t("search.locationsFound", { count: nodes.length })}
            </Text>
            {searchQuery.length >= 2 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearButton}>{t("search.clearSearch")}</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={nodes}
            renderItem={renderNodeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  buildingInfo: {
    marginBottom: 12,
  },
  buildingLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  clearButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  listContent: {
    padding: 16,
  },
  nodeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nodeInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  nodeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  nodeType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  qrCode: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
});
