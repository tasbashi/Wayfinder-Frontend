"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useBuildingStore } from "@/store/buildingStore";
import { useAuth } from "@/store/authStore";
import {
  Building,
  MapPin,
  Layers,
  Edit,
  Plus,
  ArrowLeft,
  BarChart3,
  List,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { BuildingOverview } from "@/components/features/BuildingOverview";
import { PathTester } from "@/components/features/PathTester";

type TabType = "overview" | "floors" | "pathtest";

function BuildingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const {
    currentBuilding,
    isLoading,
    error,
    fetchBuildingById,
    clearError,
  } = useBuildingStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (buildingId) {
      fetchBuildingById(buildingId);
    }
  }, [buildingId, fetchBuildingById]);

  if (isLoading && !currentBuilding) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading building..." />
        </div>
      </Layout>
    );
  }

  if (error && !currentBuilding) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorMessage message={error} />
          <Button
            onClick={() => router.push("/buildings")}
            className="mt-4"
            variant="outline"
          >
            Back to Buildings
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentBuilding) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/buildings"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Buildings
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentBuilding.name}
                </h1>
                {currentBuilding.address && (
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentBuilding.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => router.push(`/buildings/${buildingId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Building
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                ${activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("floors")}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                ${activeTab === "floors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <List className="w-4 h-4" />
              Floors ({currentBuilding.floors?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("pathtest")}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                ${activeTab === "pathtest"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Navigation className="w-4 h-4" />
              Path Test
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <BuildingOverview
            building={currentBuilding}
            onFloorClick={(floorId) =>
              router.push(`/buildings/${buildingId}/floors/${floorId}`)
            }
          />
        )}

        {activeTab === "floors" && (
          <>
            {/* Floors Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Floors</h2>
              {isAdmin && (
                <Button onClick={() => router.push(`/buildings/${buildingId}/floors/create`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Floor
                </Button>
              )}
            </div>

            {/* Floors Grid */}
            {currentBuilding.floors && currentBuilding.floors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBuilding.floors
                  .slice()
                  .sort((a, b) => b.floorNumber - a.floorNumber)
                  .map((floor) => (
                    <Card
                      key={floor.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/buildings/${buildingId}/floors/${floor.id}`)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Layers className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {floor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Floor {floor.floorNumber}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No floors added yet</p>
                  {isAdmin && (
                    <Button
                      onClick={() =>
                        router.push(`/buildings/${buildingId}/floors/create`)
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Floor
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === "pathtest" && (
          <PathTester building={currentBuilding} />
        )}
      </div>
    </Layout>
  );
}

export default function BuildingDetailPage() {
  return (
    <ProtectedRoute>
      <BuildingDetailContent />
    </ProtectedRoute>
  );
}

