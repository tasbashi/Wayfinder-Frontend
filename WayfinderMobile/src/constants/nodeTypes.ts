import {
    MapPin,
    DoorOpen,
    ArrowUpDown,
    Layers,
    Bath,
    Building2,
    Coffee,
    CircleParking,
    CircleHelp,
    type LucideIcon,
} from "lucide-react-native";
import type { NodeType } from "@/types";
import { COLORS } from "./colors";

interface NodeTypeConfig {
    label: string;
    labelTr: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

/**
 * Node Type Configuration
 */
export const NODE_TYPE_CONFIG: Record<NodeType, NodeTypeConfig> = {
    Room: {
        label: "Room",
        labelTr: "Oda",
        icon: Building2,
        color: COLORS.primary,
        bgColor: "#EEF2FF",
    },
    Corridor: {
        label: "Corridor",
        labelTr: "Koridor",
        icon: MapPin,
        color: COLORS.gray[500],
        bgColor: COLORS.gray[100],
    },
    Elevator: {
        label: "Elevator",
        labelTr: "Asansör",
        icon: Layers,
        color: COLORS.info,
        bgColor: "#DBEAFE",
    },
    Stairs: {
        label: "Stairs",
        labelTr: "Merdiven",
        icon: ArrowUpDown,
        color: COLORS.warning,
        bgColor: "#FEF3C7",
    },
    Restroom: {
        label: "Restroom",
        labelTr: "Tuvalet",
        icon: Bath,
        color: COLORS.accent,
        bgColor: "#D1FAE5",
    },
    Entrance: {
        label: "Entrance",
        labelTr: "Giriş",
        icon: DoorOpen,
        color: COLORS.success,
        bgColor: "#DCFCE7",
    },
    Exit: {
        label: "Exit",
        labelTr: "Çıkış",
        icon: DoorOpen,
        color: COLORS.error,
        bgColor: "#FEE2E2",
    },
    Office: {
        label: "Office",
        labelTr: "Ofis",
        icon: Building2,
        color: COLORS.primaryDark,
        bgColor: "#E0E7FF",
    },
    Cafeteria: {
        label: "Cafeteria",
        labelTr: "Kafeterya",
        icon: Coffee,
        color: "#D97706",
        bgColor: "#FEF3C7",
    },
    Parking: {
        label: "Parking",
        labelTr: "Otopark",
        icon: CircleParking,
        color: COLORS.gray[600],
        bgColor: COLORS.gray[100],
    },
    Other: {
        label: "Other",
        labelTr: "Diğer",
        icon: CircleHelp,
        color: COLORS.gray[400],
        bgColor: COLORS.gray[50],
    },
};

/**
 * Get node type config with fallback
 */
export const getNodeTypeConfig = (type: NodeType): NodeTypeConfig => {
    return NODE_TYPE_CONFIG[type] || NODE_TYPE_CONFIG.Other;
};
