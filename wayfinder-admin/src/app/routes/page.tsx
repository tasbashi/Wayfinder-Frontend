"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Route, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

function RoutesContent() {
  const router = useRouter();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Routes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/routes/test")}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Route className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Route Testing Tool
                </h2>
                <p className="text-gray-600 mb-4">
                  Test route calculations between nodes. Select start and end
                  nodes to calculate and visualize routes.
                </p>
                <Button variant="primary">Open Route Test</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default function RoutesPage() {
  return (
    <ProtectedRoute>
      <RoutesContent />
    </ProtectedRoute>
  );
}

