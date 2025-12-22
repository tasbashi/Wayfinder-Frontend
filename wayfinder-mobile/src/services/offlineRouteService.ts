import * as FileSystem from "expo-file-system/legacy";
import { PathResult, RouteNodeDto } from "../types/route.types";
import { NodeDto, NodeType } from "../types/node.types";
import { EdgeDto } from "../types/edge.types";
import { OfflineDataService } from "./offlineDataService";

/**
 * Helper to convert string/number nodeType to NodeType enum
 */
function parseNodeType(nodeType: NodeType | string | number): NodeType {
  if (typeof nodeType === "number") {
    return nodeType as NodeType;
  }
  if (typeof nodeType === "string") {
    // Check if it's a numeric string
    const numValue = parseInt(nodeType, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
      return numValue as NodeType;
    }
    // Otherwise try to match by name
    const typeMap: Record<string, NodeType> = {
      Room: NodeType.Room,
      Corridor: NodeType.Corridor,
      Elevator: NodeType.Elevator,
      Stairs: NodeType.Stairs,
      Entrance: NodeType.Entrance,
      Restroom: NodeType.Restroom,
      InformationDesk: NodeType.InformationDesk,
      Unknown: NodeType.Unknown,
    };
    return typeMap[nodeType] ?? NodeType.Unknown;
  }
  return nodeType;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  floorId: string;
  nodeType: string | number;
  name: string;
}

interface GraphEdge {
  fromNodeId: string;
  toNodeId: string;
  weight: number;
  isAccessible?: boolean;
}

/**
 * Simple A* pathfinding implementation for offline route calculation
 */
export class OfflineRouteService {
  /**
   * Calculate route using cached data
   */
  static async calculateRoute(
    startNodeId: string,
    endNodeId: string,
    requireAccessible = false,
    buildingId?: string
  ): Promise<PathResult> {
    // Find building ID if not provided
    if (!buildingId) {
      buildingId = await this.findBuildingIdForNode(startNodeId) ?? undefined;
      if (!buildingId) {
        throw new Error("Building not found for start node");
      }
    }

    // Get cached building data
    const cachedData = await OfflineDataService.getCachedBuilding(buildingId);
    if (!cachedData) {
      throw new Error("Building data not cached. Please download for offline use.");
    }

    const { nodes, edges } = cachedData;

    // Find start and end nodes
    const startNode = nodes.find((n) => n.id === startNodeId);
    const endNode = nodes.find((n) => n.id === endNodeId);

    if (!startNode) {
      throw new Error("Start node not found in cached data");
    }
    if (!endNode) {
      throw new Error("End node not found in cached data");
    }

    // Build graph
    const graph = this.buildGraph(nodes, edges, requireAccessible);

    // Calculate path using A*
    const path = this.aStar(
      graph,
      startNodeId,
      endNodeId,
      nodes,
      requireAccessible
    );

    if (path.length === 0) {
      return {
        pathFound: false,
        totalDistance: 0,
        estimatedTimeSeconds: 0,
        estimatedTimeMinutes: 0,
        path: [],
        instructions: [],
        errorMessage: "No path found between nodes",
      };
    }

    // Convert path to RouteNodeDto format
    const routePath: RouteNodeDto[] = path.map((nodeId, index) => {
      const node = nodes.find((n) => n.id === nodeId)!;
      const floor = cachedData.floors.find((f) => f.id === node.floorId);
      const prevNode = index > 0 ? nodes.find((n) => n.id === path[index - 1]) : null;

      return {
        nodeId: node.id,
        name: node.name,
        nodeName: node.name, // Alias for backward compatibility
        nodeType: parseNodeType(node.nodeType),
        x: node.x,
        y: node.y,
        floorId: node.floorId,
        floorName: floor?.name || "Unknown Floor",
        instruction: this.generateInstruction(node, index, path.length, nodes),
        distanceFromPrevious: prevNode
          ? this.calculateDistance(prevNode, node)
          : 0,
      };
    });

    // Calculate total distance
    const totalDistance = this.calculateTotalDistance(routePath);

    // Generate instructions
    const instructions = routePath
      .map((node) => node.instruction)
      .filter((inst): inst is string => !!inst);

    // Estimate time (assuming 1 m/s walking speed)
    const estimatedTimeSeconds = totalDistance; // 1 m/s walking speed
    const estimatedTimeMinutes = Math.ceil(estimatedTimeSeconds / 60);

    return {
      pathFound: true,
      totalDistance,
      estimatedTimeSeconds,
      estimatedTimeMinutes,
      path: routePath,
      instructions,
    };
  }

  /**
   * Build graph from nodes and edges
   */
  private static buildGraph(
    nodes: NodeDto[],
    edges: EdgeDto[],
    requireAccessible: boolean
  ): Map<string, GraphEdge[]> {
    const graph = new Map<string, GraphEdge[]>();

    // Initialize graph with all nodes
    nodes.forEach((node) => {
      graph.set(node.id, []);
    });

    // Add edges
    edges.forEach((edge) => {
      // Skip non-accessible edges if required
      if (requireAccessible && edge.isAccessible === false) {
        return;
      }

      const fromNode = nodes.find((n) => n.id === edge.nodeAId);
      const toNode = nodes.find((n) => n.id === edge.nodeBId);

      if (!fromNode || !toNode) {
        return;
      }

      const weight = edge.weight || this.calculateDistance(fromNode, toNode);

      // Add bidirectional edge
      const fromEdges = graph.get(edge.nodeAId) || [];
      fromEdges.push({
        fromNodeId: edge.nodeAId,
        toNodeId: edge.nodeBId,
        weight,
        isAccessible: edge.isAccessible,
      });
      graph.set(edge.nodeAId, fromEdges);

      const toEdges = graph.get(edge.nodeBId) || [];
      toEdges.push({
        fromNodeId: edge.nodeBId,
        toNodeId: edge.nodeAId,
        weight,
        isAccessible: edge.isAccessible,
      });
      graph.set(edge.nodeBId, toEdges);
    });

    return graph;
  }

  /**
   * A* pathfinding algorithm
   */
  private static aStar(
    graph: Map<string, GraphEdge[]>,
    startId: string,
    endId: string,
    nodes: NodeDto[],
    requireAccessible: boolean
  ): string[] {
    const startNode = nodes.find((n) => n.id === startId);
    const endNode = nodes.find((n) => n.id === endId);

    if (!startNode || !endNode) {
      return [];
    }

    const openSet = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    nodes.forEach((node) => {
      gScore.set(node.id, Infinity);
      fScore.set(node.id, Infinity);
    });

    gScore.set(startId, 0);
    fScore.set(startId, this.heuristic(startNode, endNode));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let currentId = "";
      let lowestF = Infinity;
      openSet.forEach((id) => {
        const f = fScore.get(id) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          currentId = id;
        }
      });

      if (currentId === endId) {
        // Reconstruct path
        const path: string[] = [];
        let current = endId;
        while (current) {
          path.unshift(current);
          current = cameFrom.get(current) || "";
        }
        return path;
      }

      openSet.delete(currentId);

      const neighbors = graph.get(currentId) || [];
      neighbors.forEach((edge) => {
        // Skip non-accessible edges if required
        if (requireAccessible && edge.isAccessible === false) {
          return;
        }

        const tentativeG = (gScore.get(currentId) || 0) + edge.weight;
        const neighborId = edge.toNodeId;

        if (tentativeG < (gScore.get(neighborId) || Infinity)) {
          cameFrom.set(neighborId, currentId);
          gScore.set(neighborId, tentativeG);

          const neighborNode = nodes.find((n) => n.id === neighborId);
          if (neighborNode) {
            fScore.set(
              neighborId,
              tentativeG + this.heuristic(neighborNode, endNode)
            );
          }

          if (!openSet.has(neighborId)) {
            openSet.add(neighborId);
          }
        }
      });
    }

    return []; // No path found
  }

  /**
   * Heuristic function (Euclidean distance)
   */
  private static heuristic(node1: NodeDto, node2: NodeDto): number {
    // If on different floors, add penalty
    if (node1.floorId !== node2.floorId) {
      return 1000; // Large penalty for floor changes
    }

    return Math.sqrt(
      Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
    );
  }

  /**
   * Calculate distance between two nodes
   */
  private static calculateDistance(node1: NodeDto, node2: NodeDto): number {
    if (node1.floorId !== node2.floorId) {
      return 1000; // Large distance for floor changes
    }

    return Math.sqrt(
      Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
    );
  }

  /**
   * Calculate total distance of route
   */
  private static calculateTotalDistance(path: RouteNodeDto[]): number {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += path[i].distanceFromPrevious || 0;
    }
    return total;
  }

  /**
   * Generate instruction for a node
   */
  private static generateInstruction(
    node: NodeDto,
    index: number,
    totalLength: number,
    allNodes: NodeDto[]
  ): string {
    if (index === 0) {
      return `Start at ${node.name}`;
    }

    if (index === totalLength - 1) {
      return `Arrive at destination: ${node.name}`;
    }

    const prevNode = allNodes.find((n) => n.id === allNodes[index - 1]?.id);
    if (prevNode && prevNode.floorId !== node.floorId) {
      return `Take elevator/stairs to ${node.name}`;
    }

    return `Continue to ${node.name}`;
  }

  /**
   * Find building ID for a node
   */
  private static async findBuildingIdForNode(
    nodeId: string
  ): Promise<string | null> {
    // Try to find in all cached buildings
    const cacheDir = `${FileSystem.documentDirectory}cache/`;
    try {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        return null;
      }

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      for (const file of files) {
        if (file.startsWith("building_") && file.endsWith(".json")) {
          const filePath = `${cacheDir}${file}`;
          const json = await FileSystem.readAsStringAsync(filePath);
          const data = JSON.parse(json);
          if (data.nodes?.some((n: NodeDto) => n.id === nodeId)) {
            return data.building.id;
          }
        }
      }
    } catch (error) {
      console.error("Error finding building for node:", error);
    }
    return null;
  }
}

