export const API_CONFIG = {
  baseURL: __DEV__
    ? process.env.API_URL || "https://hematological-dated-ramiro.ngrok-free.dev" // Development - from .env or fallback
    : "https://api.wayfinder.com", // Production
  timeout: 30000,
} as const;

