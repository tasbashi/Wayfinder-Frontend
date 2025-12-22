"use client";

import { Card } from "../common/Card";
import { PathResult } from "@/types/route.types";
import { Ruler, Clock, Navigation, MapPin, CheckCircle } from "lucide-react";
import { getNodeTypeLabel } from "@/utils/nodeTypeUtils";

interface RouteDisplayProps {
  routeResult: PathResult;
}

export function RouteDisplay({ routeResult }: RouteDisplayProps) {
  if (!routeResult || !routeResult.pathFound) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Navigation className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Route Found
          </h3>
          <p className="text-gray-600">
            {routeResult?.errorMessage ||
              "Unable to find a path between the selected nodes"}
          </p>
        </div>
      </Card>
    );
  }

  // Safely get numeric values with defaults
  const totalDistance = routeResult.totalDistance ?? 0;
  // Convert seconds to minutes
  const estimatedTimeMinutes = routeResult.estimatedTimeSeconds
    ? routeResult.estimatedTimeSeconds / 60
    : 0;
  const path = routeResult.path ?? [];

  return (
    <div className="space-y-4">
      {/* Route Summary */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Route Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ruler className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Distance</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalDistance.toFixed(1)} m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {estimatedTimeMinutes.toFixed(1)} min
              </p>
            </div>
          </div>
        </div>

        {/* Path Nodes */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Route Path ({path.length} nodes)
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {path.map((node, index) => (
              <div
                key={node.nodeId}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {index === 0 ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                  ) : index === path.length - 1 ? (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {node.name || 'Unnamed Node'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getNodeTypeLabel(node.nodeType)} • {node.floorName}
                  </p>
                  {/* Show instruction from node's own instruction property, or from instructions array, or fallback */}
                  {index < path.length - 1 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                      <div className="w-4 h-4 border-l-2 border-dashed border-gray-300 ml-4"></div>
                      <span>
                        {node.instruction || "Continue to next node"}
                      </span>
                      {node.distanceFromPrevious !== undefined && node.distanceFromPrevious > 0 && (
                        <span className="text-gray-400 ml-2">
                          ({node.distanceFromPrevious.toFixed(0)}m)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Turn-by-Turn Instructions */}
      {path.some(node => node.instruction) && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Turn-by-Turn Instructions
          </h2>
          <ol className="space-y-3">
            {path.filter(node => node.instruction).map((node, index) => (
              <li
                key={node.nodeId}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-700 flex-1">{node.instruction}</p>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

