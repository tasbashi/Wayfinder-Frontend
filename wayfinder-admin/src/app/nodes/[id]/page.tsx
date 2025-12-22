"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useNodeStore } from "@/store/nodeStore";
import { useAuth } from "@/store/authStore";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { Edit, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";

function NodeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;
  const {
    currentNode,
    isLoading,
    error,
    fetchNodeById,
    clearError,
  } = useNodeStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (nodeId) {
      fetchNodeById(nodeId);
    }
  }, [nodeId, fetchNodeById]);

  if (isLoading && !currentNode) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading node..." />
        </div>
      </Layout>
    );
  }

  if (error && !currentNode) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorMessage message={error} />
          <Button
            onClick={() => router.push("/nodes")}
            className="mt-4"
            variant="outline"
          >
            Back to Nodes
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentNode) {
    return null;
  }

  const nodeTypeInfo = getNodeTypeInfo(currentNode.nodeType);
  const Icon = nodeTypeInfo.icon;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/nodes"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Nodes
            </Link>
            <div className="flex items-center gap-4">
              <div className={`p-3 ${nodeTypeInfo.bgColor} rounded-lg`}>
                <Icon className={`w-8 h-8 ${nodeTypeInfo.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentNode.name}
                </h1>
                <p className="text-gray-600 mt-1">{nodeTypeInfo.label}</p>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/nodes/${nodeId}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push(`/nodes/${nodeId}/qr`)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                View QR Code
              </Button>
            </div>
          )}
        </div>

        {/* Node Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Node Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Node ID</p>
              <p className="font-mono text-sm text-gray-900">{nodeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Node Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {nodeTypeInfo.label}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">X Position</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentNode.x}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Y Position</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentNode.y}
              </p>
            </div>
            {currentNode.qrCode && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">QR Code</p>
                <p className="font-mono text-sm text-gray-900">
                  {currentNode.qrCode}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default function NodeDetailPage() {
  return (
    <ProtectedRoute>
      <NodeDetailContent />
    </ProtectedRoute>
  );
}

