"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { PopularRoutesChart } from "@/components/features/charts/PopularRoutesChart";
import { RouteCalculationsChart } from "@/components/features/charts/RouteCalculationsChart";
import { NodeTypeChart } from "@/components/features/charts/NodeTypeChart";
import { QRScansChart } from "@/components/features/charts/QRScansChart";
import { Users, Map, Navigation, QrCode } from "lucide-react";

// Mock Data
const SUMMARY_STATS = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Buildings", value: "12", icon: Map, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Routes", value: "45.2k", icon: Navigation, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "QR Scans", value: "8,901", icon: QrCode, color: "text-orange-600", bg: "bg-orange-100" },
];

const POPULAR_ROUTES_DATA = [
    { name: "Entrance -> Cafe", count: 450 },
    { name: "Lobby -> Meeting Room A", count: 380 },
    { name: "Parking -> Elevator", count: 320 },
    { name: "Reception -> HR Office", count: 290 },
    { name: "Cafeteria -> Restroom", count: 210 },
];

const ROUTE_CALCULATIONS_DATA = [
    { date: "Mon", count: 120 },
    { date: "Tue", count: 145 },
    { date: "Wed", count: 132 },
    { date: "Thu", count: 180 },
    { date: "Fri", count: 210 },
    { date: "Sat", count: 85 },
    { date: "Sun", count: 60 },
];

const NODE_TYPE_DATA = [
    { name: "Rooms", value: 45, color: "#3b82f6" },
    { name: "Corridors", value: 25, color: "#9ca3af" },
    { name: "Elevators", value: 10, color: "#10b981" },
    { name: "Stairs", value: 10, color: "#f59e0b" },
    { name: "Restrooms", value: 5, color: "#ef4444" },
    { name: "Exits", value: 5, color: "#8b5cf6" },
];

const QR_SCANS_DATA = [
    { buildingName: "Main HQ", scans: 1200 },
    { buildingName: "Tech Hub", scans: 950 },
    { buildingName: "Warehouse", scans: 450 },
    { buildingName: "Guest House", scans: 300 },
];

function AnalyticsContent() {
    return (
        <Layout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="mt-2 text-gray-600">Overview of system usage and performance</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SUMMARY_STATS.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RouteCalculationsChart data={ROUTE_CALCULATIONS_DATA} />
                    <PopularRoutesChart data={POPULAR_ROUTES_DATA} />
                    <NodeTypeChart data={NODE_TYPE_DATA} />
                    <QRScansChart data={QR_SCANS_DATA} />
                </div>
            </div>
        </Layout>
    );
}

export default function AnalyticsPage() {
    return (
        <ProtectedRoute>
            <AnalyticsContent />
        </ProtectedRoute>
    );
}
