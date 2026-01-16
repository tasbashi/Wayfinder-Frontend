import { Bath, DoorOpen, Layers, ArrowUpDown, Coffee, CircleParking, type LucideIcon } from "lucide-react-native";
import type { NodeType } from "@/types";
import { COLORS } from "./colors";

export interface QuickAction {
    id: string;
    label: string;
    labelTr: string;
    icon: LucideIcon;
    nodeType: NodeType;
    color: string;
    bgColor: string;
}

/**
 * Quick Action Buttons for Home Screen
 */
export const QUICK_ACTIONS: QuickAction[] = [
    {
        id: "restroom",
        label: "Restroom",
        labelTr: "Tuvalet",
        icon: Bath,
        nodeType: "Restroom",
        color: COLORS.accent,
        bgColor: "#D1FAE5",
    },
    {
        id: "exit",
        label: "Exit",
        labelTr: "Çıkış",
        icon: DoorOpen,
        nodeType: "Exit",
        color: COLORS.error,
        bgColor: "#FEE2E2",
    },
    {
        id: "elevator",
        label: "Elevator",
        labelTr: "Asansör",
        icon: Layers,
        nodeType: "Elevator",
        color: COLORS.info,
        bgColor: "#DBEAFE",
    },
    {
        id: "stairs",
        label: "Stairs",
        labelTr: "Merdiven",
        icon: ArrowUpDown,
        nodeType: "Stairs",
        color: COLORS.warning,
        bgColor: "#FEF3C7",
    },
    {
        id: "cafeteria",
        label: "Cafeteria",
        labelTr: "Kafeterya",
        icon: Coffee,
        nodeType: "Cafeteria",
        color: "#D97706",
        bgColor: "#FEF3C7",
    },
    {
        id: "parking",
        label: "Parking",
        labelTr: "Otopark",
        icon: CircleParking,
        nodeType: "Parking",
        color: COLORS.gray[600],
        bgColor: COLORS.gray[100],
    },
];

export type QuickActionId = (typeof QUICK_ACTIONS)[number]["id"];
