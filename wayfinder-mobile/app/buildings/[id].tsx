import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BuildingService } from "@/api/building.service";
import { BuildingDto } from "@/types/building.types";
import { Building, MapPin, Layers, Download, CheckCircle } from "lucide-react-native";

// Check if we're on a native platform (not web)
const isNative = Platform.OS !== "web";

export default function BuildingDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const [building, setBuilding] = useState<BuildingDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuilding();
    if (isNative) {
      checkCache();
    }
  }, [buildingId]);

  async function loadBuilding() {
    try {
      setIsLoading(true);
      setError(null);
      const buildingData = await BuildingService.getById(buildingId);
      setBuilding(buildingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load building");
    } finally {
      setIsLoading(false);
    }
  }

  async function checkCache() {
    if (!isNative) return;
    try {
      const { OfflineDataService } = await import("@/services/offlineDataService");
      const cached = await OfflineDataService.isBuildingCached(buildingId);
      setIsCached(cached);
    } catch (err) {
      console.error("Cache check error:", err);
    }
  }

  async function downloadForOffline() {
    if (!isNative) return;
    try {
      setIsDownloading(true);
      const { OfflineDataService } = await import("@/services/offlineDataService");
      await OfflineDataService.downloadBuildingData(buildingId);
      Alert.alert("Success", "Building downloaded for offline use");
      setIsCached(true);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to download building data"
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading building...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={loadBuilding}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!building) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Building size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>{building.name}</Text>
        {building.address && (
          <View style={styles.addressContainer}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.address}>{building.address}</Text>
          </View>
        )}
      </View>

      {/* Download for Offline - Only show on native platforms */}
      {isNative && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isCached && styles.downloadButtonCached,
            ]}
            onPress={downloadForOffline}
            disabled={isDownloading || isCached}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fff" />
            ) : isCached ? (
              <>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>
                  Available Offline
                </Text>
              </>
            ) : (
              <>
                <Download size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>
                  Download for Offline Use
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Floors Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Floors</Text>
        {building.floors && building.floors.length > 0 ? (
          <View style={styles.floorsList}>
            {building.floors.map((floor) => (
              <TouchableOpacity
                key={floor.id}
                style={styles.floorCard}
                onPress={() =>
                  router.push(`/buildings/${buildingId}/floors/${floor.id}`)
                }
              >
                <View style={styles.floorIcon}>
                  <Layers size={24} color="#10b981" />
                </View>
                <View style={styles.floorInfo}>
                  <Text style={styles.floorName}>{floor.name}</Text>
                  <Text style={styles.floorNumber}>
                    Floor {floor.floorNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No floors available</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
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
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
  },
  downloadButtonCached: {
    backgroundColor: "#10b981",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  floorsList: {
    gap: 12,
  },
  floorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  floorInfo: {
    flex: 1,
  },
  floorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  floorNumber: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});

