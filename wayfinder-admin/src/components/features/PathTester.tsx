"use client";

import { useState, useEffect, useMemo } from "react";
import { BuildingDto } from "@/types/building.types";
import { FloorDto } from "@/types/floor.types";
import { NodeDto, NodeType } from "@/types/node.types";
import { PathResult } from "@/types/route.types";
import { NodeService } from "@/api/node.service";
import { RouteService } from "@/api/route.service";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import {
  Navigation,
  MapPin,
  Clock,
  Route,
  Accessibility,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  X,
  Search,
} from "lucide-react";

interface PathTesterProps {
  building: BuildingDto;
  onPathCalculated?: (path: string[]) => void;
  initialStartNodeId?: string;
  initialEndNodeId?: string;
}

export function PathTester({
  building,
  onPathCalculated,
  initialStartNodeId,
  initialEndNodeId,
}: PathTesterProps) {
  const [allNodes, setAllNodes] = useState<NodeDto[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [startNodeId, setStartNodeId] = useState<string>(initialStartNodeId || "");
  const [endNodeId, setEndNodeId] = useState<string>(initialEndNodeId || "");
  const [requireAccessible, setRequireAccessible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all nodes for the building
  useEffect(() => {
    async function loadNodes() {
      if (!building.floors || building.floors.length === 0) {
        setIsLoadingNodes(false);
        return;
      }

      try {
        setIsLoadingNodes(true);
        const nodesPromises = building.floors.map((floor) =>
          NodeService.getByFloor(floor.id)
        );
        const nodesResults = await Promise.all(nodesPromises);
        setAllNodes(nodesResults.flat());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load nodes");
      } finally {
        setIsLoadingNodes(false);
      }
    }

    loadNodes();
  }, [building.floors]);

  // Build floor map
  const floorMap = useMemo(() => {
    const map = new Map<string, FloorDto>();
    building.floors?.forEach((floor) => map.set(floor.id, floor));
    return map;
  }, [building.floors]);

  // Filter nodes by search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return allNodes;
    const term = searchTerm.toLowerCase();
    return allNodes.filter(
      (node) =>
        node.name?.toLowerCase().includes(term) ||
        node.qrCode?.toLowerCase().includes(term)
    );
  }, [allNodes, searchTerm]);

  // Group nodes by floor
  const nodesByFloor = useMemo(() => {
    const grouped = new Map<string, NodeDto[]>();
    filteredNodes.forEach((node) => {
      const floorNodes = grouped.get(node.floorId) || [];
      floorNodes.push(node);
      grouped.set(node.floorId, floorNodes);
    });
    return grouped;
  }, [filteredNodes]);

  // Calculate route
  const handleCalculateRoute = async () => {
    if (!startNodeId || !endNodeId) {
      setError("Please select both start and end nodes");
      return;
    }

    if (startNodeId === endNodeId) {
      setError("Start and end nodes must be different");
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);
      setPathResult(null);

      const result = await RouteService.calculateRoute(
        startNodeId,
        endNodeId,
        requireAccessible
      );

      setPathResult(result);

      if (result.pathFound && onPathCalculated) {
        onPathCalculated(result.path.map((p) => p.nodeId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate route");
    } finally {
      setIsCalculating(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    setStartNodeId("");
    setEndNodeId("");
    setPathResult(null);
    setError(null);
    onPathCalculated?.([]);
  };

  // Render node option
  const renderNodeOption = (node: NodeDto) => {
    const nodeInfo = getNodeTypeInfo(node.nodeType);
    const floor = floorMap.get(node.floorId);
    return (
      <option key={node.id} value={node.id}>
        {nodeInfo.emoji} {node.name || `Node ${node.id.slice(0, 8)}`} ({floor?.name || "Unknown Floor"})
      </option>
    );
  };

  if (isLoadingNodes) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Loading nodes..." />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Path Testing
        </h3>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes by name or QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Node Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Start Node */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
              Start Node
            </label>
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select start node...</option>
              {Array.from(nodesByFloor.entries())
                .sort(([, a], [, b]) => {
                  const floorA = floorMap.get(a[0]?.floorId);
                  const floorB = floorMap.get(b[0]?.floorId);
                  return (floorB?.floorNumber || 0) - (floorA?.floorNumber || 0);
                })
                .map(([floorId, nodes]) => {
                  const floor = floorMap.get(floorId);
                  return (
                    <optgroup key={floorId} label={floor?.name || "Unknown Floor"}>
                      {nodes.map(renderNodeOption)}
                    </optgroup>
                  );
                })}
            </select>
          </div>

          {/* End Node */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1 text-red-600" />
              End Node
            </label>
            <select
              value={endNodeId}
              onChange={(e) => setEndNodeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select end node...</option>
              {Array.from(nodesByFloor.entries())
                .sort(([, a], [, b]) => {
                  const floorA = floorMap.get(a[0]?.floorId);
                  const floorB = floorMap.get(b[0]?.floorId);
                  return (floorB?.floorNumber || 0) - (floorA?.floorNumber || 0);
                })
                .map(([floorId, nodes]) => {
                  const floor = floorMap.get(floorId);
                  return (
                    <optgroup key={floorId} label={floor?.name || "Unknown Floor"}>
                      {nodes.map(renderNodeOption)}
                    </optgroup>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requireAccessible}
              onChange={(e) => setRequireAccessible(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Accessibility className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">Require wheelchair accessible path</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCalculateRoute}
            disabled={!startNodeId || !endNodeId || isCalculating}
          >
            {isCalculating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Route className="w-4 h-4 mr-2" />
                Calculate Route
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Path Result */}
      {pathResult && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {pathResult.pathFound ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Route Found</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">No Route Found</span>
              </>
            )}
          </h3>

          {pathResult.pathFound ? (
            <>
              {/* Route Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">
                    {pathResult.path.length}
                  </p>
                  <p className="text-sm text-blue-700">Steps</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">
                    {pathResult.totalDistance.toFixed(1)}m
                  </p>
                  <p className="text-sm text-green-700">Distance</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-900">
                    {Math.ceil(pathResult.estimatedTimeSeconds / 60)}min
                  </p>
                  <p className="text-sm text-purple-700">Est. Time</p>
                </div>
              </div>

              {/* Turn-by-turn instructions */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Turn-by-turn directions:</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {pathResult.path.map((step, index) => {
                    const nodeInfo = getNodeTypeInfo(step.nodeType);
                    const isStart = index === 0;
                    const isEnd = index === pathResult.path.length - 1;

                    return (
                      <div
                        key={step.nodeId}
                        className={`
                          flex items-start gap-3 p-2 rounded-lg
                          ${isStart ? "bg-green-50" : isEnd ? "bg-red-50" : "bg-gray-50"}
                        `}
                      >
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${isStart ? "bg-green-500 text-white" : isEnd ? "bg-red-500 text-white" : "bg-gray-300 text-gray-700"}
                          `}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{nodeInfo.emoji}</span>
                            <span className="font-medium">
                              {step.name || `Node ${step.nodeId.slice(0, 8)}`}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                              {step.floorName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{step.instruction}</p>
                          {step.distanceFromPrevious > 0 && (
                            <p className="text-xs text-gray-400">
                              {step.distanceFromPrevious.toFixed(1)}m from previous
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              {pathResult.errorMessage || "No path could be found between the selected nodes."}
              {requireAccessible && (
                <span className="block mt-2 text-sm text-amber-600">
                  💡 Try disabling &quot;Require wheelchair accessible path&quot; - stairs may be the only connection.
                </span>
              )}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

export default PathTester;

