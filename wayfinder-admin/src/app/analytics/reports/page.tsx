"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { FileText, Download, Mail, Calendar } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

type ReportType = "usage" | "performance" | "errors" | "audit";

export default function ReportsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportType, setReportType] = useState<ReportType>("usage");
    const [isGenerating, setIsGenerating] = useState(false);
    const { success } = useToastContext();

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Mock generation delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsGenerating(false);
        success("Report generated successfully");
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="mt-2 text-gray-600">Generate and export system reports</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Report Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Configure Report
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Report Type
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: "usage", label: "Usage Statistics", desc: "Routes, scans, and visits" },
                                                { id: "performance", label: "System Performance", desc: "Response times and load" },
                                                { id: "errors", label: "Error Logs", desc: "System errors and failures" },
                                                { id: "audit", label: "Audit Trail", desc: "Admin actions and changes" },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setReportType(type.id as ReportType)}
                                                    className={`p-4 rounded-lg border-2 text-left transition-all ${reportType === type.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <div className="font-medium text-gray-900">{type.label}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{type.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={!startDate || !endDate || isGenerating}
                                            className="flex-1"
                                        >
                                            {isGenerating ? "Generating..." : "Generate Report"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Reports */}
                        <div className="space-y-6">
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
                                <div className="space-y-4">
                                    {[
                                        { name: "Usage Report - Nov 2025", date: "2 mins ago", size: "2.4 MB" },
                                        { name: "Error Logs - Q4 2025", date: "Yesterday", size: "1.1 MB" },
                                        { name: "Audit Trail - Oct 2025", date: "3 days ago", size: "5.6 MB" },
                                    ].map((report, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded border border-gray-200">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                                                    <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Get automated reports delivered to your inbox weekly or monthly.
                                </p>
                                <Button variant="secondary" size="sm" className="w-full">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Configure Schedule
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
