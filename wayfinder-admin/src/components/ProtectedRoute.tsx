"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/authStore";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { ErrorMessage } from "./common/ErrorMessage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "BuildingManager" | "Viewer";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  // Wait for auth to be initialized before making decisions
  useEffect(() => {
    // Only redirect if auth has been initialized and user is not authenticated
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Show loading while auth is being checked
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Only return null if auth is initialized and user is not authenticated
  // (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  if (
    requiredRole &&
    user?.role !== requiredRole &&
    user?.role !== "Admin"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Access Denied"
          message="You don't have permission to access this page."
        />
      </div>
    );
  }

  return <>{children}</>;
}

