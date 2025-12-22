import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Storage, RecentSearch } from "@/utils/storage";
import { Clock, MapPin, Navigation, Trash2 } from "lucide-react-native";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { formatDistanceToNow } from "date-fns";

export default function RecentSearchesScreen() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRecentSearches();
  }, []);

  async function loadRecentSearches() {
    try {
      setIsLoading(true);
      const recent = await Storage.getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigate(nodeId: string) {
    // Use replace to avoid stacking intermediate pages
    router.replace({
      pathname: "/route/calculate",
      params: { endNodeId: nodeId },
    });
  }

  function handleClearAll() {
    Alert.alert(
      "Clear Recent Searches",
      "Are you sure you want to clear all recent searches?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await Storage.clearRecentSearches();
              await loadRecentSearches();
            } catch (error) {
              console.error("Error clearing recent searches:", error);
            }
          },
        },
      ]
    );
  }

  function renderRecentSearch({ item }: { item: RecentSearch }) {
    const nodeTypeInfo = getNodeTypeInfo(item.nodeType);
    const Icon = nodeTypeInfo.icon;
    const timeAgo = formatDistanceToNow(new Date(item.searchedAt), {
      addSuffix: true,
    });

    return (
      <TouchableOpacity
        style={styles.recentCard}
        onPress={() => handleNavigate(item.nodeId)}
      >
        <View style={styles.recentContent}>
          <View style={[styles.iconContainer, { backgroundColor: nodeTypeInfo.bgColor }]}>
            <Icon size={24} color={nodeTypeInfo.color} />
          </View>
          <View style={styles.recentInfo}>
            <Text style={styles.recentName}>{item.nodeName}</Text>
            <Text style={styles.recentType}>{nodeTypeInfo.label}</Text>
            {item.buildingName && (
              <Text style={styles.recentBuilding}>{item.buildingName}</Text>
            )}
          </View>
        </View>
        <View style={styles.recentMeta}>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#9ca3af" />
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          <Navigation size={20} color="#3b82f6" />
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading recent searches...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Clock size={28} color="#3b82f6" />
          <Text style={styles.title}>Recent Searches</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>
            {recentSearches.length} search{recentSearches.length !== 1 ? "es" : ""}
          </Text>
          {recentSearches.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {recentSearches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Recent Searches</Text>
          <Text style={styles.emptyText}>
            Your recent destination searches will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentSearches}
          renderItem={renderRecentSearch}
          keyExtractor={(item) => `${item.nodeId}-${item.searchedAt}`}
          contentContainerStyle={styles.listContent}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 40,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  recentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  recentType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  recentBuilding: {
    fontSize: 12,
    color: "#9ca3af",
  },
  recentMeta: {
    alignItems: "flex-end",
    gap: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

