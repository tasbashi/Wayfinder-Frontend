import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Storage, FavoriteDestination } from "@/utils/storage";
import { Heart, MapPin, Trash2, Navigation } from "lucide-react-native";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setIsLoading(true);
      const favs = await Storage.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveFavorite(nodeId: string) {
    try {
      await Storage.removeFavorite(nodeId);
      await loadFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  function handleNavigate(nodeId: string) {
    // Use replace to avoid stacking intermediate pages
    router.replace({
      pathname: "/route/calculate",
      params: { endNodeId: nodeId },
    });
  }

  function renderFavorite({ item }: { item: FavoriteDestination }) {
    const nodeTypeInfo = getNodeTypeInfo(item.nodeType);
    const Icon = nodeTypeInfo.icon;

    return (
      <View style={styles.favoriteCard}>
        <View style={styles.favoriteContent}>
          <View style={[styles.iconContainer, { backgroundColor: nodeTypeInfo.bgColor }]}>
            <Icon size={24} color={nodeTypeInfo.color} />
          </View>
          <View style={styles.favoriteInfo}>
            <Text style={styles.favoriteName}>{item.nodeName}</Text>
            <Text style={styles.favoriteType}>{nodeTypeInfo.label}</Text>
            {item.buildingName && (
              <Text style={styles.favoriteBuilding}>{item.buildingName}</Text>
            )}
          </View>
        </View>
        <View style={styles.favoriteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleNavigate(item.nodeId)}
          >
            <Navigation size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveFavorite(item.nodeId)}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Heart size={28} color="#ef4444" />
          <Text style={styles.title}>Favorites</Text>
        </View>
        <Text style={styles.subtitle}>
          {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Add destinations to your favorites for quick access
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.nodeId}
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
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 40,
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
  favoriteCard: {
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
  favoriteContent: {
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
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  favoriteType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  favoriteBuilding: {
    fontSize: 12,
    color: "#9ca3af",
  },
  favoriteActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});

