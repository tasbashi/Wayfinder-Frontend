"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { RouteService } from "@/api/route.service";
import { NodeService } from "@/api/node.service";
import { PathResult, RouteNodeDto } from "@/types/route.types";
import { NodeDto } from "@/types/node.types";
import { useBuildingStore } from "@/store/buildingStore";
import { useNodeStore } from "@/store/nodeStore";
import { RouteDisplay } from "@/components/features/RouteDisplay";
import { MapPin, Navigation, Clock, Ruler } from "lucide-react";

function RouteTestContent() {
  const [startNodeId, setStartNodeId] = useState<string>("");
  const [endNodeId, setEndNodeId] = useState<string>("");
  const [requireAccessible, setRequireAccessible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [availableNodes, setAvailableNodes] = useState<NodeDto[]>([]);

  const { buildings, fetchBuildings } = useBuildingStore();
  const { nodes, fetchNodes } = useNodeStore();

  useEffect(() => {
    if (!buildings) {
      fetchBuildings(1, 100);
    }
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      // Fetch all nodes and filter by building
      fetchNodes(1, 1000);
    }
  }, [selectedBuildingId, fetchNodes]);

  useEffect(() => {
    if (nodes && selectedBuildingId) {
      // Filter nodes by building (check if node's floor belongs to selected building)
      const building = buildings?.items.find((b) => b.id === selectedBuildingId);
      if (building) {
        const floorIds = building.floors?.map((f) => f.id) || [];
        const filtered = nodes.items.filter((node) =>
          floorIds.includes(node.floorId)
        );
        setAvailableNodes(filtered);
      } else {
        setAvailableNodes([]);
      }
    } else {
      setAvailableNodes(nodes?.items || []);
    }
  }, [nodes, selectedBuildingId, buildings]);

  const handleCalculateRoute = async () => {
    if (!startNodeId || !endNodeId) {
      setError("Please select both start and end nodes");
      return;
    }

    if (startNodeId === endNodeId) {
      setError("Start and end nodes must be different");
      return;
    }

    setIsCalculating(true);
    setError(null);
    setRouteResult(null);

    try {
      const result = await RouteService.calculateRoute(
        startNodeId,
        endNodeId,
        requireAccessible
      );
      setRouteResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate route"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const startNode = availableNodes.find((n) => n.id === startNodeId);
  const endNode = availableNodes.find((n) => n.id === endNodeId);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Route Testing Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Selection Panel */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Route
            </h2>

            <div className="space-y-4">
              {/* Building Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => {
                    setSelectedBuildingId(e.target.value);
                    setStartNodeId("");
                    setEndNodeId("");
                    setRouteResult(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select a building</option>
                  {buildings?.items.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Node */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Node
                </label>
                <select
                  value={startNodeId}
                  onChange={(e) => {
                    setStartNodeId(e.target.value);
                    setRouteResult(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={!selectedBuildingId || isCalculating}
                >
                  <option value="">Select start node</option>
                  {availableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                {startNode && (
                  <p className="mt-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {startNode.name} - Floor: {startNode.floorId}
                  </p>
                )}
              </div>

              {/* End Node */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Node
                </label>
                <select
                  value={endNodeId}
                  onChange={(e) => {
                    setEndNodeId(e.target.value);
                    setRouteResult(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={!selectedBuildingId || isCalculating}
                >
                  <option value="">Select end node</option>
                  {availableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                {endNode && (
                  <p className="mt-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {endNode.name} - Floor: {endNode.floorId}
                  </p>
                )}
              </div>

              {/* Accessible Route Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accessible"
                  checked={requireAccessible}
                  onChange={(e) => {
                    setRequireAccessible(e.target.checked);
                    setRouteResult(null);
                  }}
                  disabled={isCalculating}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="accessible"
                  className="text-sm font-medium text-gray-700"
                >
                  Require wheelchair-accessible route
                </label>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={handleCalculateRoute}
                disabled={
                  !startNodeId ||
                  !endNodeId ||
                  isCalculating ||
                  !selectedBuildingId
                }
                className="w-full"
                size="lg"
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Calculating Route...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Calculate Route
                  </span>
                )}
              </Button>

              {error && (
                <ErrorMessage message={error} variant="inline" />
              )}
            </div>
          </Card>

          {/* Route Result Panel */}
          <div>
            {routeResult ? (
              <RouteDisplay routeResult={routeResult} />
            ) : (
              <Card>
                <div className="text-center py-12 text-gray-500">
                  <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select start and end nodes to calculate a route</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function RouteTestPage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <RouteTestContent />
    </ProtectedRoute>
  );
}

