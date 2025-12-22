import { apiClient } from "./client";
import { LoginCredentials, LoginResponse } from "../types/auth.types";
import { ServiceResponse } from "../types/api.types";
import { TokenStorage } from "../utils/tokenStorage";

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginCredentials) {
    const response = await apiClient.post<ServiceResponse<LoginResponse>>(
      "/api/auth/login",
      credentials
    );

    if (response.data.isSuccess && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      await this.storeTokens(accessToken, refreshToken);
      return { user, tokens: { accessToken, refreshToken } };
    }

    throw new Error(response.data.errorMessage || "Login failed");
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    const response = await apiClient.post<ServiceResponse<LoginResponse>>(
      "/api/auth/refresh-token",
      { refreshToken }
    );

    if (response.data.isSuccess && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } =
        response.data.data;
      await this.storeTokens(accessToken, newRefreshToken);
      return { accessToken, refreshToken: newRefreshToken };
    }

    throw new Error("Token refresh failed");
  }

  /**
   * Logout user
   */
  static async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        await apiClient.post("/api/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    await this.clearTokens();
  }

  /**
   * Store tokens securely (Mobile: SecureStore)
   */
  private static async storeTokens(
    accessToken: string,
    refreshToken: string
  ) {
    await TokenStorage.storeTokens(accessToken, refreshToken);
  }

  /**
   * Clear stored tokens
   */
  private static async clearTokens() {
    await TokenStorage.clearTokens();
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    return await TokenStorage.getAccessToken();
  }

  /**
   * Get current refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    return await TokenStorage.getRefreshToken();
  }
}

