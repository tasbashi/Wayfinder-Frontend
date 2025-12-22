"use client";

import { NodeDto } from "@/types/node.types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { MapPin, Edit, Trash2, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNodeStore } from "@/store/nodeStore";
import { useAuth } from "@/store/authStore";

interface NodeCardProps {
  node: NodeDto;
}

export function NodeCard({ node }: NodeCardProps) {
  const router = useRouter();
  const { deleteNode, isLoading } = useNodeStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const nodeTypeInfo = getNodeTypeInfo(node.nodeType);
  const Icon = nodeTypeInfo.icon;

  const handleDelete = async () => {
    if (
      window.confirm(`Are you sure you want to delete "${node.name}"?`)
    ) {
      try {
        await deleteNode(node.id);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${nodeTypeInfo.bgColor} rounded-lg`}>
              <Icon className={`w-5 h-5 ${nodeTypeInfo.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {node.name}
              </h3>
              <p className="text-sm text-gray-600">{nodeTypeInfo.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
            <MapPin className="w-4 h-4" />
            <span>
              Position: ({node.x}, {node.y})
            </span>
          </div>

          {node.qrCode && (
            <div className="mt-2 text-xs text-gray-500 font-mono">
              QR: {node.qrCode}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/nodes/${node.id}/edit`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => router.push(`/nodes/${node.id}`)}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/nodes/${node.id}/qr`)}
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

