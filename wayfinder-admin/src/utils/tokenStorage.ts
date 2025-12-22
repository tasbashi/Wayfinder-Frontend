/**
 * Token storage utilities for Web
 * Separated from AuthService to avoid circular dependencies
 * 
 * Uses sessionStorage for persistence across page refreshes
 * Note: For production, consider using HttpOnly cookies instead
 */
export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = "wayfinder_access_token";
  private static readonly REFRESH_TOKEN_KEY = "wayfinder_refresh_token";
  private static readonly USER_KEY = "wayfinder_user";

  /**
   * Store tokens securely (Web: sessionStorage)
   */
  static async storeTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      } catch (error) {
        console.error("Failed to store tokens:", error);
        // Fallback to memory storage if sessionStorage fails
        (window as any).__accessToken = accessToken;
        (window as any).__refreshToken = refreshToken;
      }
    }
  }

  /**
   * Store user info
   */
  static async storeUser(user: any): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } catch (error) {
        console.error("Failed to store user:", error);
      }
    }
  }

  /**
   * Get stored user info
   */
  static async getUser(): Promise<any | null> {
    if (typeof window !== "undefined") {
      try {
        const userStr = sessionStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        console.error("Failed to get user:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear stored tokens
   */
  static async clearTokens(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
      } catch (error) {
        console.error("Failed to clear tokens:", error);
      }
      // Also clear memory storage fallback
      delete (window as any).__accessToken;
      delete (window as any).__refreshToken;
    }
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
      try {
        // Try sessionStorage first
        const token = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
        if (token) return token;
        
        // Fallback to memory storage
        return (window as any).__accessToken || null;
      } catch (error) {
        console.error("Failed to get access token:", error);
        return (window as any).__accessToken || null;
      }
    }
    return null;
  }

  /**
   * Get current refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
      try {
        // Try sessionStorage first
        const token = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
        if (token) return token;
        
        // Fallback to memory storage
        return (window as any).__refreshToken || null;
      } catch (error) {
        console.error("Failed to get refresh token:", error);
        return (window as any).__refreshToken || null;
      }
    }
    return null;
  }
}

