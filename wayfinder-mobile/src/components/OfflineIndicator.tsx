import { View, Text, StyleSheet, Animated } from "react-native";
import { WifiOff, Wifi } from "lucide-react-native";
import { useOffline } from "@/hooks/useOffline";
import { useEffect, useRef } from "react";

export function OfflineIndicator() {
  const { isOffline } = useOffline();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (isOffline) {
      // Slide down when offline
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide up when online
      Animated.spring(slideAnim, {
        toValue: -50,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <WifiOff size={16} color="#fff" />
      <Text style={styles.text}>No Internet Connection</Text>
      <Text style={styles.subtext}>Using cached data</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  subtext: {
    color: "#fee2e2",
    fontSize: 12,
  },
});

