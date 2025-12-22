"use client";

// Initialize i18n before any components render
import "@/config/i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { ToastProvider, useToastContext } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/common/Toast";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Initialize auth state on app load
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

function ToastWrapper({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToastContext();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthInitializer>
          <ToastWrapper>{children}</ToastWrapper>
        </AuthInitializer>
      </ToastProvider>
    </QueryClientProvider>
  );
}
