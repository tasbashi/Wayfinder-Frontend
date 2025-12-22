import { Platform } from "react-native";

// Check if we're on a native platform (not web)
const isNative = Platform.OS !== "web";

// Lazy load SecureStore only on native platforms
let SecureStore: typeof import("expo-secure-store") | null = null;

async function getSecureStore() {
  if (!isNative) return null;
  if (!SecureStore) {
    SecureStore = await import("expo-secure-store");
  }
  return SecureStore;
}

/**
 * Token storage utilities
 * Uses SecureStore on mobile and localStorage on web
 * Note: localStorage is less secure but works for web development
 */
export class TokenStorage {
  /**
   * Store tokens securely
   */
  static async storeTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    if (isNative) {
      const store = await getSecureStore();
      if (store) {
        await store.setItemAsync("accessToken", accessToken);
        await store.setItemAsync("refreshToken", refreshToken);
      }
    } else {
      // Use localStorage on web
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  /**
   * Clear stored tokens
   */
  static async clearTokens(): Promise<void> {
    if (isNative) {
      const store = await getSecureStore();
      if (store) {
        await store.deleteItemAsync("accessToken");
        await store.deleteItemAsync("refreshToken");
      }
    } else {
      // Use localStorage on web
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    if (isNative) {
      const store = await getSecureStore();
      if (store) {
        return await store.getItemAsync("accessToken");
      }
      return null;
    } else {
      // Use localStorage on web
      return localStorage.getItem("accessToken");
    }
  }

  /**
   * Get current refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    if (isNative) {
      const store = await getSecureStore();
      if (store) {
        return await store.getItemAsync("refreshToken");
      }
      return null;
    } else {
      // Use localStorage on web
      return localStorage.getItem("refreshToken");
    }
  }
}

