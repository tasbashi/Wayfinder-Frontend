export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7014",
  timeout: 30000,
} as const;

