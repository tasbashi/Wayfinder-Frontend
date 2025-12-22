"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { FloorService } from "@/api/floor.service";
import { NodeService } from "@/api/node.service";
import { EdgeService } from "@/api/edge.service";
import { RouteService } from "@/api/route.service";
import { CorridorService } from "@/api/corridor.service";
import { FloorDto } from "@/types/floor.types";
import { NodeDto, CreateNodeCommand, UpdateNodeCommand } from "@/types/node.types";
import { EdgeDto, CreateEdgeCommand, UpdateEdgeCommand } from "@/types/edge.types";
import { PathResult } from "@/types/route.types";
import { Corridor, PathPoint, CreateCorridorCommand, UpdateCorridorCommand } from "@/types/corridor.types";
import { FloorPlanEditor } from "@/components/features/FloorPlanEditor";
import { NodeEditModal } from "@/components/features/FloorPlanEditor/NodeEditModal";
import { EdgeEditModal } from "@/components/features/FloorPlanEditor/EdgeEditModal";
import { CorridorEditModal } from "@/components/features/FloorPlanEditor/CorridorEditModal";
import { ArrowLeft, Edit, Trash2, Layers, RefreshCw, Map, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

function FloorDetailContent() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const floorId = params.floorId as string;
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "Admin";

  // Data state
  const [floor, setFloor] = useState<FloorDto | null>(null);
  const [allFloors, setAllFloors] = useState<FloorDto[]>([]);
  const [nodes, setNodes] = useState<NodeDto[]>([]);
  const [edges, setEdges] = useState<EdgeDto[]>([]);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFloorPlan, setShowFloorPlan] = useState(true);

  // Modal state
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [nodeModalMode, setNodeModalMode] = useState<"create" | "edit">("create");
  const [selectedNode, setSelectedNode] = useState<NodeDto | null>(null);
  const [newNodePosition, setNewNodePosition] = useState<{ x: number; y: number } | null>(null);

  const [edgeModalOpen, setEdgeModalOpen] = useState(false);
  const [edgeModalMode, setEdgeModalMode] = useState<"create" | "edit">("create");
  const [selectedEdge, setSelectedEdge] = useState<EdgeDto | null>(null);
  const [edgeNodeAId, setEdgeNodeAId] = useState<string | null>(null);
  const [edgeNodeBId, setEdgeNodeBId] = useState<string | null>(null);

  // Path test state
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [pathHighlight, setPathHighlight] = useState<string[]>([]);
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);

  // Corridor modal state
  const [corridorModalOpen, setCorridorModalOpen] = useState(false);
  const [corridorModalMode, setCorridorModalMode] = useState<"create" | "edit">("create");
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null);
  const [newCorridorPoints, setNewCorridorPoints] = useState<PathPoint[]>([]);

  // Load floor data
  useEffect(() => {
    loadFloor();
  }, [floorId]);

  // Load nodes and edges when floor is loaded
  useEffect(() => {
    if (floor) {
      loadNodesAndEdges();
      loadAllFloors();
      loadCorridors();
    }
  }, [floor?.id]);

  async function loadFloor() {
    try {
      setIsLoading(true);
      setError(null);
      const floorData = await FloorService.getById(floorId);
      setFloor(floorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load floor");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllFloors() {
    try {
      const floors = await FloorService.getByBuilding(buildingId);
      setAllFloors(floors);
    } catch (err) {
      console.error("Failed to load all floors:", err);
    }
  }

  async function loadCorridors() {
    try {
      const floorCorridors = await CorridorService.getByFloor(floorId);
      setCorridors(floorCorridors);
    } catch (err) {
      console.error("Failed to load corridors:", err);
      setCorridors([]);
    }
  }

  async function loadNodesAndEdges() {
    try {
      setIsLoadingNodes(true);

      // Load nodes for this floor
      const floorNodes = await NodeService.getByFloor(floorId);
      setNodes(floorNodes);

      // Load edges connected to nodes on this floor (efficient - only fetches relevant edges)
      try {
        const nodeIds = floorNodes.map(n => n.id);
        const relevantEdges = await EdgeService.getByFloorNodes(nodeIds);
        setEdges(relevantEdges);
      } catch (edgeErr) {
        console.error("Failed to load edges:", edgeErr);
        setEdges([]);
      }
    } catch (err) {
      console.error("Failed to load nodes:", err);
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoadingNodes(false);
    }
  }

  const handleRefresh = useCallback(() => {
    loadFloor();
    if (floor) {
      loadNodesAndEdges();
      loadCorridors();
    }
  }, [floor]);

  // Node click - just select (no modal)
  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      // Don't open modal on single click - allows drag to work
    }
  }, [nodes]);

  // Node double click - open edit modal
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && isAdmin) {
      setSelectedNode(node);
      setNodeModalMode("edit");
      setNodeModalOpen(true);
    }
  }, [nodes, isAdmin]);

  // Node create - from canvas click
  const handleNodeCreate = useCallback((position: { x: number; y: number }) => {
    setNewNodePosition(position);
    setSelectedNode(null);
    setNodeModalMode("create");
    setNodeModalOpen(true);
  }, []);

  // Node position change - drag
  const handleNodePositionChange = useCallback(async (nodeId: string, x: number, y: number) => {
    try {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      await NodeService.update(nodeId, {
        ...node,
        id: nodeId,
        x,
        y,
        nodeType: typeof node.nodeType === 'number'
          ? ['Room', 'Corridor', 'Elevator', 'Stairs', 'Entrance', 'Restroom', 'InformationDesk', 'Unknown'][node.nodeType]
          : node.nodeType,
      });

      // Update local state
      setNodes(prev => prev.map(n =>
        n.id === nodeId ? { ...n, x, y } : n
      ));

      showToast("Node position updated", "success");
    } catch (err) {
      console.error("Failed to update node position:", err);
      showToast("Failed to update node position", "error");
    }
  }, [nodes, showToast]);

  // Edge click - just select (no modal)
  const handleEdgeClick = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (edge) {
      setSelectedEdge(edge);
      // Don't open modal on single click
    }
  }, [edges]);

  // Edge double click - open edit modal
  const handleEdgeDoubleClick = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (edge && isAdmin) {
      setSelectedEdge(edge);
      setEdgeModalMode("edit");
      setEdgeModalOpen(true);
    }
  }, [edges, isAdmin]);

  // Path test - calculate route between two nodes
  const handlePathTest = useCallback(async (startNodeId: string, endNodeId: string) => {
    try {
      setIsCalculatingPath(true);
      setPathResult(null);
      setPathHighlight([]);

      const result = await RouteService.calculateRoute(
        startNodeId,
        endNodeId,
        false
      );

      setPathResult(result);

      if (result.pathFound && result.path) {
        // Highlight path nodes
        const nodeIds = result.path.map(p => p.nodeId);
        setPathHighlight(nodeIds);
        showToast(`Route found! ${result.path.length} steps, ${Math.round(result.totalDistance)}m`, "success");
      } else {
        showToast(result.errorMessage || "No route found between these nodes", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to calculate route", "error");
      setPathResult(null);
      setPathHighlight([]);
    } finally {
      setIsCalculatingPath(false);
    }
  }, [showToast]);

  // Edge create - from two node clicks
  const handleEdgeCreate = useCallback((nodeAId: string, nodeBId: string) => {
    setEdgeNodeAId(nodeAId);
    setEdgeNodeBId(nodeBId);
    setSelectedEdge(null);
    setEdgeModalMode("create");
    setEdgeModalOpen(true);
  }, []);

  // Save node (create or update)
  const handleSaveNode = useCallback(async (data: CreateNodeCommand | UpdateNodeCommand) => {
    if ("id" in data) {
      // Update
      await NodeService.update(data.id, data);
      setNodes(prev => prev.map(n => {
        if (n.id === data.id) {
          return {
            ...n,
            name: data.name,
            nodeType: data.nodeType as unknown as number,
            x: data.x,
            y: data.y,
            qrCode: data.qrCode || "",
          };
        }
        return n;
      }));
      showToast("Node updated successfully", "success");
    } else {
      // Create
      const newId = await NodeService.create(data);
      const newNode: NodeDto = {
        id: newId,
        name: data.name,
        nodeType: data.nodeType as unknown as number,
        x: data.x,
        y: data.y,
        qrCode: data.qrCode || "",
        floorId: data.floorId,
      };
      setNodes(prev => [...prev, newNode]);
      showToast("Node created successfully", "success");
    }
  }, [showToast]);

  // Delete node
  const handleDeleteNode = useCallback(async (nodeId: string) => {
    await NodeService.delete(nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    // Also remove edges connected to this node
    setEdges(prev => prev.filter(e => e.nodeAId !== nodeId && e.nodeBId !== nodeId));
    showToast("Node deleted successfully", "success");
  }, [showToast]);

  // Save edge (create or update)
  const handleSaveEdge = useCallback(async (data: CreateEdgeCommand | UpdateEdgeCommand) => {
    if ("id" in data) {
      // Update
      await EdgeService.update(data.id, data);
      setEdges(prev => prev.map(e => {
        if (e.id === data.id) {
          return {
            ...e,
            nodeAId: data.nodeAId,
            nodeBId: data.nodeBId,
            weight: data.weight,
            edgeType: data.edgeType,
            isAccessible: data.isAccessible,
          };
        }
        return e;
      }));
      showToast("Edge updated successfully", "success");
    } else {
      // Create
      const newId = await EdgeService.create(data);
      const newEdge: EdgeDto = {
        id: newId,
        nodeAId: data.nodeAId,
        nodeBId: data.nodeBId,
        weight: data.weight,
        edgeType: data.edgeType || "Walking" as any,
        isAccessible: data.isAccessible ?? true,
      };
      setEdges(prev => [...prev, newEdge]);
      showToast("Edge created successfully", "success");
    }
  }, [showToast]);

  // Delete edge
  const handleDeleteEdge = useCallback(async (edgeId: string) => {
    await EdgeService.delete(edgeId);
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    showToast("Edge deleted successfully", "success");
  }, [showToast]);

  // Corridor create - from canvas drawing (opens modal)
  const handleCorridorCreate = useCallback((pathPoints: PathPoint[]) => {
    setNewCorridorPoints(pathPoints);
    setSelectedCorridor(null);
    setCorridorModalMode("create");
    setCorridorModalOpen(true);
  }, []);

  // Corridor click - just select
  const handleCorridorClick = useCallback((corridorId: string) => {
    const corridor = corridors.find(c => c.id === corridorId);
    if (corridor) {
      setSelectedCorridor(corridor);
    }
  }, [corridors]);

  // Save corridor (create or update)
  const handleSaveCorridor = useCallback(async (data: CreateCorridorCommand | UpdateCorridorCommand) => {
    if ("id" in data) {
      // Update
      await CorridorService.update(data.id, data);
      // Reload corridors to get updated data
      loadCorridors();
      showToast("Corridor updated successfully", "success");
    } else {
      // Create
      const newId = await CorridorService.create(data);
      // Reload corridors to get new data with parsed path
      loadCorridors();
      showToast("Corridor created successfully", "success");
    }
  }, [showToast]);

  // Delete corridor
  const handleDeleteCorridor = useCallback(async (corridorId: string) => {
    await CorridorService.delete(corridorId);
    setCorridors(prev => prev.filter(c => c.id !== corridorId));
    showToast("Corridor deleted successfully", "success");
  }, [showToast]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${floor?.name}"? This action cannot be undone.`
      )
    ) {
      try {
        setIsLoading(true);
        await FloorService.delete(floorId);
        router.push(`/buildings/${buildingId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete floor");
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !floor) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading floor..." />
        </div>
      </Layout>
    );
  }

  if (error && !floor) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorMessage message={error} />
          <Button
            onClick={() => router.push(`/buildings/${buildingId}`)}
            className="mt-4"
            variant="outline"
          >
            Back to Building
          </Button>
        </div>
      </Layout>
    );
  }

  if (!floor) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/buildings/${buildingId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Building
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {floor.name}
                </h1>
                <p className="text-gray-600 mt-1">Floor {floor.floorNumber}</p>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/buildings/${buildingId}/floors/${floorId}/edit`)
                }
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Floor Info */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Floor Information</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingNodes}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingNodes ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFloorPlan(!showFloorPlan)}
              >
                <Map className="w-4 h-4 mr-2" />
                {showFloorPlan ? 'Hide' : 'Show'} Floor Plan
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Floor Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {floor.floorNumber >= 0 ? `Floor ${floor.floorNumber}` : `Basement ${Math.abs(floor.floorNumber)}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nodes</p>
              <p className="text-lg font-semibold text-gray-900">{nodes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Edges</p>
              <p className="text-lg font-semibold text-gray-900">{edges.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Floor ID</p>
              <p className="font-mono text-xs text-gray-500 truncate" title={floor.id}>
                {floor.id}
              </p>
            </div>
          </div>
        </Card>

        {/* Floor Plan Editor */}
        {showFloorPlan && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Floor Plan</h2>
              {isLoadingNodes && (
                <span className="text-sm text-gray-500">Loading nodes...</span>
              )}
            </div>

            {floor.floorPlanImageUrl ? (
              <>
                <FloorPlanEditor
                  floor={floor}
                  nodes={nodes}
                  edges={edges}
                  corridors={corridors}
                  allFloors={allFloors}
                  mode={isAdmin ? "select" : "view"}
                  readonly={!isAdmin}
                  showEdges={true}
                  showLabels={true}
                  showCorridors={true}
                  showCrossFloorIndicators={true}
                  onNodeClick={handleNodeClick}
                  onNodeDoubleClick={handleNodeDoubleClick}
                  onNodeCreate={isAdmin ? handleNodeCreate : undefined}
                  onNodePositionChange={isAdmin ? handleNodePositionChange : undefined}
                  onEdgeClick={handleEdgeClick}
                  onEdgeDoubleClick={handleEdgeDoubleClick}
                  onEdgeCreate={isAdmin ? handleEdgeCreate : undefined}
                  onCorridorClick={handleCorridorClick}
                  onCorridorCreate={isAdmin ? handleCorridorCreate : undefined}
                  onPathTest={handlePathTest}
                  highlightPath={pathHighlight}
                />

                {/* Path Test Result */}
                {(pathResult || isCalculatingPath) && (
                  <Card className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Path Test Result</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPathResult(null);
                          setPathHighlight([]);
                        }}
                      >
                        Clear
                      </Button>
                    </div>

                    {isCalculatingPath ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <LoadingSpinner size="sm" />
                        <span>Calculating route...</span>
                      </div>
                    ) : pathResult?.pathFound ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Steps</p>
                            <p className="text-xl font-bold text-gray-900">{pathResult.path.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Distance</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(pathResult.totalDistance)}m</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Est. Time</p>
                            <p className="text-xl font-bold text-gray-900">
                              {Math.ceil(pathResult.estimatedTimeSeconds / 60)} min
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Route Instructions:</p>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {pathResult.path.map((step, idx) => (
                              <div
                                key={step.nodeId}
                                className={`text-sm p-2 rounded ${idx === 0
                                  ? "bg-green-50 text-green-800"
                                  : idx === pathResult.path.length - 1
                                    ? "bg-red-50 text-red-800"
                                    : "bg-gray-50 text-gray-700"
                                  }`}
                              >
                                <span className="font-medium">{idx + 1}.</span> {step.instruction}
                                {step.name && <span className="text-gray-500"> ({step.name})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-red-600">
                        <p className="font-medium">No route found</p>
                        <p className="text-sm">{pathResult?.errorMessage || "These nodes are not connected"}</p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Map className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">No floor plan image</p>
                  <p className="text-sm">Upload a floor plan image to visualize nodes</p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push(`/buildings/${buildingId}/floors/${floorId}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Upload Floor Plan
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Nodes List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nodes on this Floor</h2>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNewNodePosition({ x: 100, y: 100 });
                  setSelectedNode(null);
                  setNodeModalMode("create");
                  setNodeModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            )}
          </div>

          {nodes.length === 0 ? (
            <p className="text-gray-600">No nodes on this floor yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{node.name || 'Unnamed'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {typeof node.nodeType === 'number'
                            ? ['Room', 'Corridor', 'Elevator', 'Stairs', 'Entrance', 'Restroom', 'Info Desk', 'Unknown'][node.nodeType]
                            : node.nodeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-500">({node.x}, {node.y})</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-gray-500">{node.qrCode || '-'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedNode(node);
                                setNodeModalMode("edit");
                                setNodeModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/nodes/${node.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edges List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edges on this Floor</h2>
            <span className="text-sm text-gray-500">{edges.length} connections</span>
          </div>

          {edges.length === 0 ? (
            <p className="text-gray-600">No edges on this floor yet. Use the floor plan editor to connect nodes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accessible</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {edges.map((edge) => {
                    const nodeA = nodes.find(n => n.id === edge.nodeAId);
                    const nodeB = nodes.find(n => n.id === edge.nodeBId);
                    return (
                      <tr key={edge.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{nodeA?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{nodeB?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{edge.edgeType}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{edge.weight}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm ${edge.isAccessible ? 'text-green-600' : 'text-red-600'}`}>
                            {edge.isAccessible ? '✓ Yes' : '✗ No'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEdge(edge);
                                setEdgeModalMode("edit");
                                setEdgeModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Node Edit Modal */}
      <NodeEditModal
        isOpen={nodeModalOpen}
        onClose={() => {
          setNodeModalOpen(false);
          setSelectedNode(null);
          setNewNodePosition(null);
        }}
        mode={nodeModalMode}
        floorId={floorId}
        initialPosition={newNodePosition || undefined}
        node={selectedNode || undefined}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
      />

      {/* Edge Edit Modal */}
      <EdgeEditModal
        isOpen={edgeModalOpen}
        onClose={() => {
          setEdgeModalOpen(false);
          setSelectedEdge(null);
          setEdgeNodeAId(null);
          setEdgeNodeBId(null);
        }}
        mode={edgeModalMode}
        edge={selectedEdge || undefined}
        nodeAId={edgeNodeAId || undefined}
        nodeBId={edgeNodeBId || undefined}
        nodes={nodes}
        floors={allFloors}
        onSave={handleSaveEdge}
        onDelete={handleDeleteEdge}
      />

      {/* Corridor Edit Modal */}
      <CorridorEditModal
        isOpen={corridorModalOpen}
        onClose={() => {
          setCorridorModalOpen(false);
          setSelectedCorridor(null);
          setNewCorridorPoints([]);
        }}
        mode={corridorModalMode}
        floorId={floorId}
        pathPoints={newCorridorPoints.length > 0 ? newCorridorPoints : undefined}
        corridor={selectedCorridor || undefined}
        onSave={handleSaveCorridor}
        onDelete={handleDeleteCorridor}
      />
    </Layout>
  );
}

export default function FloorDetailPage() {
  return (
    <ProtectedRoute>
      <FloorDetailContent />
    </ProtectedRoute>
  );
}

