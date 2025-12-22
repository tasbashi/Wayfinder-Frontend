import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Text,
  Animated,
} from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { RouteNodeDto } from "@/types/route.types";
import { FloorService } from "@/api/floor.service";
import { FloorDto } from "@/types/floor.types";
import { RoutePathOverlay } from "./RoutePathOverlay";
import { fadeIn } from "@/utils/animations";

interface FloorPlanViewProps {
  floorId: string;
  routePath: RouteNodeDto[];
  currentStepIndex: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISPLAY_HEIGHT = SCREEN_HEIGHT * 0.55;

export function FloorPlanView({
  floorId,
  routePath,
  currentStepIndex,
}: FloorPlanViewProps) {
  const [floor, setFloor] = useState<FloorDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: SCREEN_WIDTH, height: DISPLAY_HEIGHT });

  // Animation values
  const routeOpacity = useRef(new Animated.Value(0)).current;
  const routeScale = useRef(new Animated.Value(0.95)).current;

  // Filter route path for current floor
  const floorRoutePath = routePath.filter((node) => node.floorId === floorId);
  const currentStep = routePath[currentStepIndex];
  const isOnCurrentFloor = currentStep?.floorId === floorId;

  useEffect(() => {
    loadFloor();
    // Reset animations when floor changes
    routeOpacity.setValue(0);
    routeScale.setValue(0.95);
  }, [floorId]);

  // Animate route when it becomes visible
  useEffect(() => {
    if (floorRoutePath.length > 0 && isOnCurrentFloor && !isLoading && imageSize.width > 0) {
      fadeIn(routeOpacity, 400, 150).start();
      Animated.spring(routeScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [floorRoutePath.length, isOnCurrentFloor, isLoading, currentStepIndex, imageSize.width]);

  async function loadFloor() {
    try {
      setIsLoading(true);
      setError(null);
      const floorData = await FloorService.getById(floorId);
      setFloor(floorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load floor plan");
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate display size maintaining aspect ratio
  const calculateDisplaySize = (imgWidth: number, imgHeight: number) => {
    const aspectRatio = imgWidth / imgHeight;
    let newWidth = SCREEN_WIDTH;
    let newHeight = SCREEN_WIDTH / aspectRatio;

    if (newHeight > DISPLAY_HEIGHT) {
      newHeight = DISPLAY_HEIGHT;
      newWidth = DISPLAY_HEIGHT * aspectRatio;
    }

    return { width: newWidth, height: newHeight };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading floor plan...</Text>
        </View>
      </View>
    );
  }

  if (error || !floor || !floor.floorPlanImageUrl) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>🗺️</Text>
          <Text style={styles.errorTitle}>Floor Plan Unavailable</Text>
          <Text style={styles.errorText}>
            {error || "The floor plan for this location is not available."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floor indicator badge */}
      <View style={styles.floorBadge}>
        <Text style={styles.floorBadgeText}>{floor.name}</Text>
      </View>

      <ReactNativeZoomableView
        maxZoom={3}
        minZoom={0.8}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        style={styles.zoomContainer}
        contentWidth={displaySize.width}
        contentHeight={displaySize.height}
      >
        <View style={[styles.imageContainer, { width: displaySize.width, height: displaySize.height }]}>
          <Image
            source={{ uri: floor.floorPlanImageUrl }}
            style={[styles.floorPlanImage, { width: displaySize.width, height: displaySize.height }]}
            resizeMode="contain"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              setImageSize({ width, height });
              const newDisplaySize = calculateDisplaySize(width, height);
              setDisplaySize(newDisplaySize);
            }}
          />

          {/* SVG Overlay for Route */}
          {isOnCurrentFloor && floorRoutePath.length > 0 && imageSize.width > 0 && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: routeOpacity,
                  transform: [{ scale: routeScale }],
                },
              ]}
            >
              <RoutePathOverlay
                floorRoutePath={floorRoutePath}
                currentStep={currentStep}
                imageSize={imageSize}
                displaySize={displaySize}
              />
            </Animated.View>
          )}
        </View>
      </ReactNativeZoomableView>

      {/* Zoom hint */}
      <View style={styles.zoomHint}>
        <Text style={styles.zoomHintText}>Pinch to zoom • Drag to pan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 24,
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 24,
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  floorBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(59, 130, 246, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floorBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  zoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  floorPlanImage: {
    borderRadius: 12,
  },
  zoomHint: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  zoomHintText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
});

