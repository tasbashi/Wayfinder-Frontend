import { useState, useEffect } from "react";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
}

// Check if we're on web
const isWeb = Platform.OS === "web";

/**
 * Hook to detect online/offline status
 * Uses React Native NetInfo for native and navigator.onLine for web
 */
export function useOffline(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isOffline: false,
    connectionType: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    if (isWeb) {
      // Use browser's navigator.onLine API for web
      const updateStatus = () => {
        const online = typeof navigator !== "undefined" ? navigator.onLine : true;
        setStatus({
          isOnline: online,
          isOffline: !online,
          connectionType: "unknown",
          isInternetReachable: online,
        });
      };

      // Get initial state
      updateStatus();

      // Listen for online/offline events
      window.addEventListener("online", updateStatus);
      window.addEventListener("offline", updateStatus);

      return () => {
        window.removeEventListener("online", updateStatus);
        window.removeEventListener("offline", updateStatus);
      };
    }

    // Native: Use NetInfo
    // Get initial state
    NetInfo.fetch().then((state) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        isOffline: !(state.isConnected ?? false),
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        isOffline: !(state.isConnected ?? false),
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}

