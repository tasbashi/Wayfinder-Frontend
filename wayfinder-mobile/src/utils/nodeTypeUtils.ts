import { NodeType } from "../types/node.types";
import {
  DoorClosed,
  ArrowRight,
  MoveVertical,
  Footprints,
  WashingMachine,
  DoorOpen,
  Building,
  Info,
  HelpCircle,
} from "lucide-react-native";

export interface NodeTypeInfo {
  icon: any; // Lucide icon component
  label: string;
  color: string;
  bgColor: string;
}

export const NODE_TYPE_INFO: Record<NodeType, NodeTypeInfo> = {
  [NodeType.Room]: {
    icon: DoorClosed,
    label: "Room",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  [NodeType.Corridor]: {
    icon: ArrowRight,
    label: "Corridor",
    color: "#4b5563",
    bgColor: "#f3f4f6",
  },
  [NodeType.Elevator]: {
    icon: MoveVertical,
    label: "Elevator",
    color: "#9333ea",
    bgColor: "#f3e8ff",
  },
  [NodeType.Stairs]: {
    icon: Footprints,
    label: "Stairs",
    color: "#ea580c",
    bgColor: "#ffedd5",
  },
  [NodeType.Entrance]: {
    icon: Building,
    label: "Entrance",
    color: "#16a34a",
    bgColor: "#dcfce7",
  },
  [NodeType.Restroom]: {
    icon: WashingMachine,
    label: "Restroom",
    color: "#0891b2",
    bgColor: "#cffafe",
  },
  [NodeType.InformationDesk]: {
    icon: Info,
    label: "Information Desk",
    color: "#4f46e5",
    bgColor: "#e0e7ff",
  },
  [NodeType.Unknown]: {
    icon: HelpCircle,
    label: "Unknown",
    color: "#6b7280",
    bgColor: "#f3f4f6",
  },
};

export function getNodeTypeInfo(nodeType: NodeType | string | number): NodeTypeInfo {
  // Handle string name (e.g., "Room", "Corridor")
  if (typeof nodeType === 'string') {
    // Check if it's a numeric string (legacy) or a name string
    const numericValue = Number(nodeType);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 7) {
      // It's a numeric string, convert to enum
      const info = NODE_TYPE_INFO[numericValue as NodeType];
      if (info) return info;
    } else {
      // It's a name string, find matching enum value
      const enumEntry = Object.entries(NODE_TYPE_INFO).find(
        ([_, info]) => info.label === nodeType || info.label.toLowerCase() === nodeType.toLowerCase()
      );
      if (enumEntry) {
        return enumEntry[1];
      }
    }
  }

  // Handle number/enum
  if (typeof nodeType === 'number') {
    const info = NODE_TYPE_INFO[nodeType as NodeType];
    if (info) return info;
  }

  // Fallback to Unknown or Room
  console.warn(`Unknown node type: ${nodeType}, falling back to Unknown`);
  return NODE_TYPE_INFO[NodeType.Unknown] || NODE_TYPE_INFO[NodeType.Room];
}

export function getNodeTypeLabel(nodeType: NodeType | string | number): string {
  return getNodeTypeInfo(nodeType).label;
}

/**
 * Convert NodeType enum to string name (e.g., NodeType.Room -> "Room")
 */
export function getNodeTypeName(nodeType: NodeType | string | number): string {
  return getNodeTypeInfo(nodeType).label;
}

/**
 * Convert string name to NodeType enum (e.g., "Room" -> NodeType.Room)
 */
export function getNodeTypeFromName(name: string): NodeType {
  const enumEntry = Object.entries(NODE_TYPE_INFO).find(
    ([_, info]) => info.label === name
  );
  if (enumEntry) {
    return Number(enumEntry[0]) as NodeType;
  }
  return NodeType.Room; // Default fallback
}

