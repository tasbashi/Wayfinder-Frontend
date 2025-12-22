import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useBuildingStore } from "@/store/buildingStore";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { BuildingDto } from "@/types/building.types";
import { Building, ChevronRight, AlertCircle, MapPin, Search, X } from "lucide-react-native";
import { fadeIn, scaleIn } from "@/utils/animations";

export default function BuildingsScreen() {
  const { t } = useTranslation();
  const { buildings, isLoading, error, loadBuildings, clearError } =
    useBuildingStore();
  const { fontSizeMultiplier } = useAccessibility();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter buildings based on search query
  const filteredBuildings = useMemo(() => {
    const items = buildings?.items || [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();
    return items.filter(
      (building) =>
        building.name?.toLowerCase().includes(query) ||
        building.address?.toLowerCase().includes(query)
    );
  }, [buildings?.items, searchQuery]);

  // Animation values for header - start visible to avoid flash
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBuildings();

    // Animate header on mount
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = () => {
    clearError();
    loadBuildings();
  };

  const handleBuildingPress = (building: BuildingDto) => {
    router.push(`/buildings/${building.id}`);
  };

  const renderBuildingCard = ({ item, index }: { item: BuildingDto; index: number }) => {
    return (
      <AnimatedBuildingCard
        building={item}
        index={index}
        onPress={() => handleBuildingPress(item)}
        fontSizeMultiplier={fontSizeMultiplier}
        t={t}
      />
    );
  };

  if (isLoading && !buildings) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { fontSize: 16 * fontSizeMultiplier }]}>
            {t("buildings.loadingBuildings")}
          </Text>
        </View>
      </View>
    );
  }

  if (error && !buildings) {
    return (
      <View style={styles.center}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <AlertCircle size={48} color="#ef4444" />
          </View>
          <Text style={[styles.errorTitle, { fontSize: 18 * fontSizeMultiplier }]}>
            {t("buildings.loadError")}
          </Text>
          <Text style={[styles.errorText, { fontSize: 14 * fontSizeMultiplier }]}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.retryButton}
            accessibilityLabel={t("common.retry")}
            accessibilityRole="button"
          >
            <Text style={[styles.retryText, { fontSize: 16 * fontSizeMultiplier }]}>
              {t("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
      >
        <Text
          style={[styles.title, { fontSize: 28 * fontSizeMultiplier }]}
          accessibilityRole="header"
        >
          {t("buildings.title")}
        </Text>
        <Text style={[styles.subtitle, { fontSize: 14 * fontSizeMultiplier }]}>
          {t("buildings.subtitle")}
        </Text>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { fontSize: 16 * fontSizeMultiplier }]}
            placeholder={t("buildings.searchPlaceholder")}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t("buildings.searchPlaceholder")}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
              accessibilityLabel={t("search.clearSearch")}
            >
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text style={[styles.searchResultsCount, { fontSize: 12 * fontSizeMultiplier }]}>
            {t("search.locationsFound", { count: filteredBuildings.length })}
          </Text>
        )}
      </View>

      <FlatList
        data={filteredBuildings}
        keyExtractor={(item) => item.id}
        renderItem={renderBuildingCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Building size={64} color="#9ca3af" />
            </View>
            <Text style={[styles.emptyText, { fontSize: 18 * fontSizeMultiplier }]}>
              {t("buildings.noBuildings")}
            </Text>
            <Text style={[styles.emptySubtext, { fontSize: 14 * fontSizeMultiplier }]}>
              {t("buildings.noBuildingsDesc")}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Animated Building Card Component
interface AnimatedBuildingCardProps {
  building: BuildingDto;
  index: number;
  onPress: () => void;
  fontSizeMultiplier: number;
  t: ReturnType<typeof useTranslation>['t'];
}

function AnimatedBuildingCard({
  building,
  index,
  onPress,
  fontSizeMultiplier,
  t
}: AnimatedBuildingCardProps) {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 80; // Staggered animation delay

    Animated.parallel([
      fadeIn(cardOpacity, 300, delay),
      scaleIn(cardScale, 300, delay),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const floorCount = building.floors?.length || 0;

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [
          { scale: cardScale },
          { translateY: cardTranslateY },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={`${building.name}${building.address ? `, ${building.address}` : ""}${floorCount > 0 ? `, ${t("buildings.floor", { count: floorCount })}` : ""}`}
        accessibilityRole="button"
        accessibilityHint={t("buildings.subtitle")}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Building size={28} color="#3b82f6" />
          </View>
          <View style={styles.cardText}>
            <Text
              style={[styles.buildingName, { fontSize: 18 * fontSizeMultiplier }]}
              numberOfLines={1}
            >
              {building.name}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={14} color="#6b7280" />
              <Text
                style={[styles.address, { fontSize: 14 * fontSizeMultiplier }]}
                numberOfLines={2}
              >
                {building.address || t("buildings.noAddress")}
              </Text>
            </View>
            {floorCount > 0 && (
              <View style={styles.floorBadge}>
                <Text style={[styles.floorCount, { fontSize: 12 * fontSizeMultiplier }]}>
                  {t("buildings.floor", { count: floorCount })}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.chevronContainer}>
            <ChevronRight size={24} color="#9ca3af" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  errorContainer: {
    alignItems: "center",
    padding: 32,
    maxWidth: 300,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    padding: 4,
  },
  searchResultsCount: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  buildingName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  floorBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  floorCount: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
