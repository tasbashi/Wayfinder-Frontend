"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EdgeService } from "@/api/edge.service";
import { EdgeDto } from "@/types/edge.types";
import { useNodeStore } from "@/store/nodeStore";
import { Plus, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/authStore";

function EdgesContent() {
  const [edges, setEdges] = useState<EdgeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchNodeById } = useNodeStore();
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    loadEdges();
  }, []);

  async function loadEdges() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await EdgeService.getAll();
      setEdges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load edges");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      window.confirm("Are you sure you want to delete this edge?")
    ) {
      try {
        await EdgeService.delete(id);
        await loadEdges();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete edge");
      }
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading edges..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edges</h1>
            <p className="mt-2 text-gray-600">
              Manage connections between nodes
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => router.push("/edges/create")} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Edge
            </Button>
          )}
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {edges.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No edges found. Create connections between nodes.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {edges.map((edge) => (
              <Card key={edge.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Connection
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Node A: <span className="font-mono">{edge.nodeAId}</span>
                      </p>
                      <p className="text-gray-600">
                        Node B: <span className="font-mono">{edge.nodeBId}</span>
                      </p>
                      <p className="text-gray-600">
                        Weight: <span className="font-semibold">{edge.weight}</span>
                      </p>
                      <p className="text-gray-600">
                        Accessible:{" "}
                        <span
                          className={
                            edge.isAccessible
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {edge.isAccessible ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/edges/${edge.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(edge.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function EdgesPage() {
  return (
    <ProtectedRoute>
      <EdgesContent />
    </ProtectedRoute>
  );
}

