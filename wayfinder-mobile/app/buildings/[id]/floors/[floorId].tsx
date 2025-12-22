import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FloorService } from "@/api/floor.service";
import { NodeService } from "@/api/node.service";
import { FloorDto } from "@/types/floor.types";
import { NodeDto } from "@/types/node.types";
import { Layers, MapPin, Navigation, ChevronLeft } from "lucide-react-native";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import Svg, { Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function FloorDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const floorId = params.floorId as string;
  const buildingId = params.id as string;
  
  const [floor, setFloor] = useState<FloorDto | null>(null);
  const [nodes, setNodes] = useState<NodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDto | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadFloorData();
  }, [floorId]);

  async function loadFloorData() {
    try {
      setIsLoading(true);
      setError(null);
      
      const [floorData, nodesData] = await Promise.all([
        FloorService.getById(floorId),
        NodeService.getByFloor(floorId),
      ]);
      
      console.log('Floor data:', floorData);
      console.log('Nodes data:', nodesData);
      console.log('Nodes count:', nodesData.length);
      
      setFloor(floorData);
      setNodes(nodesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load floor data");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNodeSelect(node: NodeDto) {
    setSelectedNode(node);
  }

  function handleNavigateToNode() {
    if (selectedNode) {
      // Use replace to avoid stacking intermediate pages
      router.replace({
        pathname: "/route/calculate",
        params: { endNodeId: selectedNode.id },
      });
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading floor plan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={loadFloorData}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!floor) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.iconContainer}>
            <Layers size={24} color="#10b981" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{floor.name}</Text>
            <Text style={styles.subtitle}>
              {nodes.length} location{nodes.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Floor Plan */}
      <View style={styles.floorPlanContainer}>
        {floor.floorPlanImageUrl ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            maximumZoomScale={3}
            minimumZoomScale={1}
            contentContainerStyle={styles.floorPlanScroll}
          >
            <View 
              style={styles.floorPlanWrapper}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                console.log('Display size:', { width, height });
                setDisplaySize({ width, height });
              }}
            >
              <Image
                source={{ uri: floor.floorPlanImageUrl }}
                style={styles.floorPlanImage}
                resizeMode="contain"
                onLoad={(e) => {
                  const { width, height } = e.nativeEvent.source;
                  console.log('Original image size:', { width, height });
                  setImageSize({ width, height });
                }}
                onError={(error) => {
                  console.error('Image load error:', error);
                }}
              />
              
              {/* Node markers overlay - Using display size with viewBox for proper scaling */}
              {imageSize.width > 0 && displaySize.width > 0 && nodes.length > 0 ? (
                <Svg
                  style={[StyleSheet.absoluteFill, { position: 'absolute', top: 0, left: 0 }]}
                  width={displaySize.width}
                  height={displaySize.height}
                  viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {nodes.map((node) => {
                    try {
                      const isSelected = selectedNode?.id === node.id;
                      const nodeTypeInfo = getNodeTypeInfo(node.nodeType);
                      
                      console.log(`Node ${node.name} at (${node.x}, ${node.y}) - Type: ${node.nodeType}`);
                      
                      // Safety check for valid coordinates
                      if (node.x === undefined || node.y === undefined || !nodeTypeInfo) {
                        console.warn(`Invalid node data:`, node);
                        return null;
                      }
                      
                      return (
                        <Circle
                          key={node.id}
                          cx={node.x}
                          cy={node.y}
                          r={isSelected ? 20 : 15}
                          fill={isSelected ? "#f59e0b" : nodeTypeInfo.color}
                          stroke="#fff"
                          strokeWidth="3"
                          opacity={0.9}
                          onPress={() => {
                            console.log('Node pressed:', node.name);
                            handleNodeSelect(node);
                          }}
                        />
                      );
                    } catch (error) {
                      console.error(`Error rendering node ${node.id}:`, error);
                      return null;
                    }
                  })}
                </Svg>
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
                  <Text style={{ color: 'red', padding: 10, backgroundColor: 'white' }}>
                    Debug Info:{'\n'}
                    Image: {imageSize.width}x{imageSize.height}{'\n'}
                    Display: {displaySize.width}x{displaySize.height}{'\n'}
                    Nodes: {nodes.length}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noFloorPlan}>
            <MapPin size={48} color="#d1d5db" />
            <Text style={styles.noFloorPlanText}>No floor plan available</Text>
          </View>
        )}
      </View>

      {/* Node List */}
      <ScrollView style={styles.nodeList}>
        <Text style={styles.sectionTitle}>Locations on this floor</Text>
        {nodes.length > 0 ? (
          nodes.map((node) => {
            const nodeTypeInfo = getNodeTypeInfo(node.nodeType);
            const Icon = nodeTypeInfo?.icon;
            const isSelected = selectedNode?.id === node.id;

            // Safety check: if Icon is undefined, skip rendering this node
            if (!Icon) {
              console.warn(`Icon not found for node type: ${node.nodeType}`, node);
              return null;
            }

            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.nodeCard,
                  isSelected && styles.nodeCardSelected,
                ]}
                onPress={() => handleNodeSelect(node)}
              >
                <View
                  style={[
                    styles.nodeIcon,
                    { backgroundColor: nodeTypeInfo.bgColor },
                  ]}
                >
                  <Icon size={20} color={nodeTypeInfo.color} />
                </View>
                <View style={styles.nodeInfo}>
                  <Text style={styles.nodeName}>{node.name}</Text>
                  <Text style={styles.nodeType}>{nodeTypeInfo.label}</Text>
                </View>
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => {
                    setSelectedNode(node);
                    handleNavigateToNode();
                  }}
                >
                  <Navigation size={20} color="#3b82f6" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No locations on this floor</Text>
          </View>
        )}
      </ScrollView>

      {/* Selected Node Action */}
      {selectedNode && (
        <View style={styles.selectedNodeBar}>
          <View style={styles.selectedNodeInfo}>
            <Text style={styles.selectedNodeName}>{selectedNode.name}</Text>
            <Text style={styles.selectedNodeType}>
              {getNodeTypeInfo(selectedNode.nodeType).label}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.navigateActionButton}
            onPress={handleNavigateToNode}
          >
            <Navigation size={20} color="#fff" />
            <Text style={styles.navigateActionText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  floorPlanContainer: {
    height: height * 0.35,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  floorPlanScroll: {
    alignItems: "center",
    justifyContent: "center",
  },
  floorPlanWrapper: {
    position: "relative",
    width: width,
    height: height * 0.35,
  },
  floorPlanImage: {
    width: width,
    height: height * 0.35,
  },
  noFloorPlan: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFloorPlanText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9ca3af",
  },
  nodeList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  nodeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  nodeCardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  nodeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nodeInfo: {
    flex: 1,
  },
  nodeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  nodeType: {
    fontSize: 14,
    color: "#6b7280",
  },
  navigateButton: {
    padding: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  selectedNodeBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedNodeInfo: {
    flex: 1,
    marginRight: 16,
  },
  selectedNodeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  selectedNodeType: {
    fontSize: 14,
    color: "#6b7280",
  },
  navigateActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  navigateActionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

