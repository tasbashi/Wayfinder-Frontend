"use client";

import { useEffect, useState, useMemo } from "react";
import { BuildingDto } from "@/types/building.types";
import { FloorDto } from "@/types/floor.types";
import { NodeDto } from "@/types/node.types";
import { EdgeDto, EdgeType } from "@/types/edge.types";
import { NodeService } from "@/api/node.service";
import { EdgeService } from "@/api/edge.service";
import { Card } from "../common/Card";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { getEdgeTypeInfo, getAllEdgeTypes } from "@/utils/edgeTypeUtils";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { NodeType } from "@/types/node.types";
import {
  Layers,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Users,
  MapPin,
} from "lucide-react";

interface BuildingOverviewProps {
  building: BuildingDto;
  onFloorClick?: (floorId: string) => void;
}

interface FloorStats {
  floorId: string;
  floorName: string;
  floorNumber: number;
  nodeCount: number;
  nodesByType: Record<string, number>;
  edgeCount: number;
  crossFloorEdges: CrossFloorEdge[];
}

interface CrossFloorEdge {
  edgeId: string;
  edgeType: EdgeType;
  fromFloorId: string;
  fromFloorName: string;
  fromNodeId: string;
  fromNodeName?: string;
  toFloorId: string;
  toFloorName: string;
  toNodeId: string;
  toNodeName?: string;
  isAccessible: boolean;
}

export function BuildingOverview({ building, onFloorClick }: BuildingOverviewProps) {
  const [allNodes, setAllNodes] = useState<NodeDto[]>([]);
  const [allEdges, setAllEdges] = useState<EdgeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all nodes and edges for the building
  useEffect(() => {
    async function loadData() {
      if (!building.floors || building.floors.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch nodes for all floors
        const nodesPromises = building.floors.map((floor) =>
          NodeService.getByFloor(floor.id)
        );
        const nodesResults = await Promise.all(nodesPromises);
        const nodes = nodesResults.flat();
        setAllNodes(nodes);

        // Fetch all edges (we'll filter by building nodes)
        const allEdgesData = await EdgeService.getAll(1, 1000);
        const nodeIds = new Set(nodes.map((n) => n.id));
        const buildingEdges = allEdgesData.filter(
          (edge) => nodeIds.has(edge.nodeAId) || nodeIds.has(edge.nodeBId)
        );
        setAllEdges(buildingEdges);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [building.floors]);

  // Build floor map for quick lookup
  const floorMap = useMemo(() => {
    const map = new Map<string, FloorDto>();
    building.floors?.forEach((floor) => map.set(floor.id, floor));
    return map;
  }, [building.floors]);

  // Build node map for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeDto>();
    allNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [allNodes]);

  // Calculate floor statistics
  const floorStats = useMemo((): FloorStats[] => {
    if (!building.floors) return [];

    return building.floors
      .map((floor) => {
        const floorNodes = allNodes.filter((n) => n.floorId === floor.id);
        const floorNodeIds = new Set(floorNodes.map((n) => n.id));

        // Count edges where both nodes are on this floor
        const internalEdges = allEdges.filter(
          (e) => floorNodeIds.has(e.nodeAId) && floorNodeIds.has(e.nodeBId)
        );

        // Find cross-floor edges
        const crossFloorEdges: CrossFloorEdge[] = [];
        allEdges.forEach((edge) => {
          const nodeA = nodeMap.get(edge.nodeAId);
          const nodeB = nodeMap.get(edge.nodeBId);
          if (!nodeA || !nodeB) return;

          // Check if this edge crosses floors and involves this floor
          if (nodeA.floorId !== nodeB.floorId) {
            if (nodeA.floorId === floor.id || nodeB.floorId === floor.id) {
              const fromNode = nodeA.floorId === floor.id ? nodeA : nodeB;
              const toNode = nodeA.floorId === floor.id ? nodeB : nodeA;
              const fromFloor = floorMap.get(fromNode.floorId);
              const toFloor = floorMap.get(toNode.floorId);

              // Only add if this floor is the "from" floor (avoid duplicates)
              if (fromNode.floorId === floor.id && fromFloor && toFloor) {
                crossFloorEdges.push({
                  edgeId: edge.id,
                  edgeType: edge.edgeType,
                  fromFloorId: fromFloor.id,
                  fromFloorName: fromFloor.name,
                  fromNodeId: fromNode.id,
                  fromNodeName: fromNode.name,
                  toFloorId: toFloor.id,
                  toFloorName: toFloor.name,
                  toNodeId: toNode.id,
                  toNodeName: toNode.name,
                  isAccessible: edge.isAccessible,
                });
              }
            }
          }
        });

        // Count nodes by type
        const nodesByType: Record<string, number> = {};
        floorNodes.forEach((node) => {
          const key = String(node.nodeType);
          nodesByType[key] = (nodesByType[key] || 0) + 1;
        });

        return {
          floorId: floor.id,
          floorName: floor.name,
          floorNumber: floor.floorNumber,
          nodeCount: floorNodes.length,
          nodesByType,
          edgeCount: internalEdges.length,
          crossFloorEdges,
        };
      })
      .sort((a, b) => b.floorNumber - a.floorNumber); // Sort by floor number descending
  }, [building.floors, allNodes, allEdges, nodeMap, floorMap]);

  // Count total cross-floor connections
  const totalCrossFloorEdges = useMemo(() => {
    return floorStats.reduce((sum, floor) => sum + floor.crossFloorEdges.length, 0);
  }, [floorStats]);

  // Count accessible vs non-accessible cross-floor edges
  const accessibilityStats = useMemo(() => {
    const allCrossFloor = floorStats.flatMap((f) => f.crossFloorEdges);
    return {
      accessible: allCrossFloor.filter((e) => e.isAccessible).length,
      notAccessible: allCrossFloor.filter((e) => !e.isAccessible).length,
    };
  }, [floorStats]);

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading building overview..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {building.floors?.length || 0}
              </p>
              <p className="text-sm text-blue-700">Floors</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{allNodes.length}</p>
              <p className="text-sm text-green-700">Total Nodes</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900">{allEdges.length}</p>
              <p className="text-sm text-purple-700">Total Edges</p>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-900">{totalCrossFloorEdges}</p>
              <p className="text-sm text-amber-700">Cross-Floor Links</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Accessibility Summary */}
      {totalCrossFloorEdges > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Accessibility Overview
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">
                {accessibilityStats.accessible} accessible
              </span>
            </div>
            {accessibilityStats.notAccessible > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-amber-700 font-medium">
                  {accessibilityStats.notAccessible} not accessible (stairs)
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Floor Diagram */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Building Structure</h3>
        <div className="space-y-2">
          {floorStats.map((floor, index) => {
            const hasCrossFloor = floor.crossFloorEdges.length > 0;
            const nextFloor = floorStats[index + 1];

            return (
              <div key={floor.floorId}>
                {/* Floor Card */}
                <div
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${hasCrossFloor ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}
                    hover:border-blue-400 hover:shadow-md
                  `}
                  onClick={() => onFloorClick?.(floor.floorId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold
                          ${hasCrossFloor ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}
                        `}
                      >
                        {floor.floorNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{floor.floorName}</h4>
                        <p className="text-sm text-gray-600">
                          {floor.nodeCount} nodes · {floor.edgeCount} edges
                        </p>
                      </div>
                    </div>

                    {/* Node type breakdown */}
                    <div className="flex items-center gap-2">
                      {Object.entries(floor.nodesByType).slice(0, 4).map(([typeStr, count]) => {
                        const typeNum = parseInt(typeStr, 10) as NodeType;
                        const nodeInfo = getNodeTypeInfo(typeNum);
                        return (
                          <span
                            key={typeStr}
                            className="text-xs px-2 py-1 rounded-full bg-white border"
                            title={nodeInfo.label}
                          >
                            {nodeInfo.emoji} {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cross-floor connections indicator */}
                  {hasCrossFloor && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-2">
                        Cross-floor connections:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {floor.crossFloorEdges.map((edge) => {
                          const edgeInfo = getEdgeTypeInfo(edge.edgeType);
                          return (
                            <span
                              key={edge.edgeId}
                              className={`
                                text-xs px-2 py-1 rounded-full flex items-center gap-1
                                ${edge.isAccessible ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                              `}
                              title={`${edge.fromNodeName || "Node"} → ${edge.toNodeName || "Node"} (${edge.toFloorName})`}
                            >
                              {edgeInfo.icon} → {edge.toFloorName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection line between floors */}
                {nextFloor && (
                  <div className="flex justify-center py-1">
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edge Type Legend */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Connection Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getAllEdgeTypes().map(({ value, info }) => (
            <div key={value} className="flex items-center gap-2">
              <span className="text-xl">{info.icon}</span>
              <div>
                <p className="font-medium text-sm">{info.label}</p>
                <p className="text-xs text-gray-500">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default BuildingOverview;

