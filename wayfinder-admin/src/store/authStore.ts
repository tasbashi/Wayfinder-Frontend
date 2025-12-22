import { create } from "zustand";
import { AuthService } from "../api/auth.service";
import { User, LoginCredentials } from "../types/auth.types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track if auth has been checked at least once
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until first check completes
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await AuthService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await AuthService.getRefreshToken();
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      // Clear tokens and user
      await AuthService.getCurrentUser(); // This will be cleared by logout
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AuthService.getAccessToken();
      if (token) {
        // Restore user from storage
        const user = await AuthService.getCurrentUser();
        set({ 
          isAuthenticated: true, 
          user: user,
          isLoading: false,
          isInitialized: true
        });
      } else {
        set({ 
          isAuthenticated: false, 
          user: null, 
          isLoading: false,
          isInitialized: true
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        isInitialized: true
      });
    }
  },

  clearError: () => set({ error: null }),
}));

