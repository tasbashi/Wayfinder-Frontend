import { create } from "zustand";
import { AuthService } from "../api/auth.service";
import { User, LoginCredentials } from "../types/auth.types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const token = await AuthService.getAccessToken();
      if (token) {
        set({ isAuthenticated: true });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));

