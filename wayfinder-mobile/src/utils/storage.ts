/**
 * Storage utilities for mobile app
 * Uses AsyncStorage for non-sensitive data
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@wayfinder:favorites";
const RECENT_SEARCHES_KEY = "@wayfinder:recent_searches";
const MAX_RECENT_SEARCHES = 20;

export interface FavoriteDestination {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
  addedAt: number;
}

export interface RecentSearch {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
  searchedAt: number;
}

export class Storage {
  /**
   * Get all favorites
   */
  static async getFavorites(): Promise<FavoriteDestination[]> {
    try {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  /**
   * Add favorite
   */
  static async addFavorite(favorite: Omit<FavoriteDestination, "addedAt">): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      // Check if already exists
      if (!favorites.some((f) => f.nodeId === favorite.nodeId)) {
        favorites.push({
          ...favorite,
          addedAt: Date.now(),
        });
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  /**
   * Remove favorite
   */
  static async removeFavorite(nodeId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((f) => f.nodeId !== nodeId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  /**
   * Check if node is favorite
   */
  static async isFavorite(nodeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((f) => f.nodeId === nodeId);
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  }

  /**
   * Get recent searches
   */
  static async getRecentSearches(): Promise<RecentSearch[]> {
    try {
      const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Error getting recent searches:", error);
      return [];
    }
  }

  /**
   * Add recent search
   */
  static async addRecentSearch(
    search: Omit<RecentSearch, "searchedAt">
  ): Promise<void> {
    try {
      let recent = await this.getRecentSearches();
      // Remove if already exists
      recent = recent.filter((r) => r.nodeId !== search.nodeId);
      // Add to beginning
      recent.unshift({
        ...search,
        searchedAt: Date.now(),
      });
      // Keep only last MAX_RECENT_SEARCHES
      recent = recent.slice(0, MAX_RECENT_SEARCHES);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error("Error adding recent search:", error);
      throw error;
    }
  }

  /**
   * Clear recent searches
   */
  static async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
      throw error;
    }
  }
}

