import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { PathResult } from "@/types/route.types";
import { Ruler, Clock, Navigation, MapPin, ChevronLeft } from "lucide-react-native";
import { getNodeTypeLabel } from "@/utils/nodeTypeUtils";
import { useRouteStore } from "@/store/routeStore";

export default function RouteResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);
  const { startNodeId, endNodeId, requireAccessible } = useRouteStore();

  useEffect(() => {
    try {
      const routeData = params.routeData as string;
      if (routeData) {
        const parsed = JSON.parse(routeData) as PathResult;
        setRouteResult(parsed);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("errors.generic"));
      router.back();
    }
  }, [params.routeData]);

  const handleStartNavigation = () => {
    if (!routeResult) return;

    router.push({
      pathname: "/navigation",
      params: {
        startNodeId: startNodeId || "",
        endNodeId: endNodeId || "",
        requireAccessible: String(requireAccessible),
        routeData: params.routeData as string,
      },
    });
  };

  if (!routeResult) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("route.routePath")}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("route.loadingRoute")}</Text>
        </View>
      </View>
    );
  }

  if (!routeResult.pathFound) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("route.noRouteFound")}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Navigation size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>{t("route.noRouteFound")}</Text>
          <Text style={styles.errorMessage}>
            {routeResult.errorMessage || t("route.noRouteMessage")}
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>{t("route.goBack")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("route.routeFound")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Route Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: "#eff6ff" }]}>
                <Ruler size={24} color="#3b82f6" />
              </View>
              <Text style={styles.summaryLabel}>{t("route.distance")}</Text>
              <Text style={styles.summaryValue}>
                {(routeResult.totalDistance ?? 0).toFixed(1)} m
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: "#d1fae5" }]}>
                <Clock size={24} color="#10b981" />
              </View>
              <Text style={styles.summaryLabel}>{t("route.time")}</Text>
              <Text style={styles.summaryValue}>
                {((routeResult.estimatedTimeMinutes ?? routeResult.estimatedTimeSeconds / 60) || 0).toFixed(1)} min
              </Text>
            </View>
          </View>
        </View>

        {/* Route Path */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("route.routePath")}</Text>
          <View style={styles.pathContainer}>
            {(routeResult.path ?? []).map((node, index) => (
              <View key={node.nodeId} style={styles.pathItem}>
                <View style={styles.pathLine}>
                  {index === 0 ? (
                    <View style={styles.pathIconStart}>
                      <MapPin size={20} color="#fff" />
                    </View>
                  ) : index === (routeResult.path ?? []).length - 1 ? (
                    <View style={styles.pathIconEnd}>
                      <MapPin size={20} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.pathIcon}>
                      <Text style={styles.pathIconText}>{index + 1}</Text>
                    </View>
                  )}
                  {index < routeResult.path.length - 1 && (
                    <View style={styles.pathConnector} />
                  )}
                </View>
                <View style={styles.pathInfo}>
                  <Text style={styles.pathNodeName}>{node.nodeName || node.name || 'Unknown'}</Text>
                  <Text style={styles.pathNodeDetails}>
                    {getNodeTypeLabel(node.nodeType)} • {node.floorName}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Turn-by-Turn Instructions */}
        {routeResult.instructions && routeResult.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("route.turnByTurn")}</Text>
            <View style={styles.instructionsContainer}>
              {routeResult.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Start Navigation Button */}
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleStartNavigation}
        >
          <Navigation size={24} color="#fff" />
          <Text style={styles.navigateButtonText}>{t("route.startNavigation")}</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  pathContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pathItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  pathLine: {
    alignItems: "center",
    marginRight: 12,
  },
  pathIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  pathIconStart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  pathIconEnd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  pathIconText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  pathConnector: {
    width: 2,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginTop: 4,
  },
  pathInfo: {
    flex: 1,
    paddingTop: 4,
  },
  pathNodeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  pathNodeDetails: {
    fontSize: 14,
    color: "#6b7280",
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navigateButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
