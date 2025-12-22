"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card } from "@/components/common/Card";

interface RouteCalculationsChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

export function RouteCalculationsChart({ data }: RouteCalculationsChartProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Route Calculations (Last 7 Days)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="Calculations"
                            stroke="#10b981"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
