import { NodeType } from "../types/node.types";
import {
  DoorClosed,
  Navigation,
  MoveVertical,
  TrendingUp,
  WashingMachine,
  Building,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export interface NodeTypeInfo {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  /** Hex color for canvas rendering */
  hexColor: string;
  /** Emoji icon for canvas rendering */
  emoji: string;
}

export const NODE_TYPE_INFO: Record<NodeType, NodeTypeInfo> = {
  [NodeType.Room]: {
    icon: DoorClosed,
    label: "Room",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hexColor: "#3B82F6",
    emoji: "🚪",
  },
  [NodeType.Corridor]: {
    icon: Navigation,
    label: "Corridor",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    hexColor: "#6B7280",
    emoji: "🚶",
  },
  [NodeType.Elevator]: {
    icon: MoveVertical,
    label: "Elevator",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    hexColor: "#8B5CF6",
    emoji: "🛗",
  },
  [NodeType.Stairs]: {
    icon: TrendingUp,
    label: "Stairs",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    hexColor: "#F59E0B",
    emoji: "🪜",
  },
  [NodeType.Entrance]: {
    icon: Building,
    label: "Entrance",
    color: "text-green-600",
    bgColor: "bg-green-100",
    hexColor: "#10B981",
    emoji: "🏠",
  },
  [NodeType.Restroom]: {
    icon: WashingMachine,
    label: "Restroom",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    hexColor: "#06B6D4",
    emoji: "🚻",
  },
  [NodeType.InformationDesk]: {
    icon: HelpCircle,
    label: "Information Desk",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    hexColor: "#6366F1",
    emoji: "ℹ️",
  },
  [NodeType.Unknown]: {
    icon: HelpCircle,
    label: "Unknown",
    color: "text-gray-400",
    bgColor: "bg-gray-50",
    hexColor: "#9CA3AF",
    emoji: "❓",
  },
};

export function getNodeTypeInfo(nodeType: NodeType | string | number): NodeTypeInfo {
  // Handle string name (e.g., "Room", "Corridor")
  if (typeof nodeType === 'string') {
    // Check if it's a numeric string (legacy) or a name string
    const numericValue = Number(nodeType);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 9) {
      // It's a numeric string, convert to enum
      return NODE_TYPE_INFO[numericValue as NodeType] || NODE_TYPE_INFO[NodeType.Room];
    } else {
      // It's a name string, find matching enum value
      const enumEntry = Object.entries(NODE_TYPE_INFO).find(
        ([_, info]) => info.label === nodeType
      );
      if (enumEntry) {
        return enumEntry[1];
      }
    }
  }

  // Handle number/enum
  const enumValue = typeof nodeType === 'number' ? nodeType : Number(nodeType);
  return NODE_TYPE_INFO[enumValue as NodeType] || NODE_TYPE_INFO[NodeType.Room];
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

