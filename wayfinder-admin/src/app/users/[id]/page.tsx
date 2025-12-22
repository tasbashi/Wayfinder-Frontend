"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { ArrowLeft, Save, Key, CheckCircle, XCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { UserDto, UpdateUserCommand, UserRole } from "@/types/user.types";
import { UserService } from "@/api/user.service";
import { useToastContext } from "@/contexts/ToastContext";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error: showError } = useToastContext();
  
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateUserCommand>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Viewer",
  });

  useEffect(() => {
    if (params.id) {
      loadUser(params.id as string);
    }
  }, [params.id]);

  const loadUser = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await UserService.getById(id);
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load user";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!params.id) return;

    try {
      setIsSaving(true);
      await UserService.update(params.id as string, formData);
      success("User updated successfully");
      router.push("/users");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="Admin">
        <Layout>
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error && !user) {
    return (
      <ProtectedRoute requiredRole="Admin">
        <Layout>
          <div className="p-6">
            <ErrorMessage
              message={error}
              onRetry={() => loadUser(params.id as string)}
            />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="Admin">
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="mt-2 text-gray-600">Update user details and role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">User ID</div>
                  <div className="text-sm font-mono text-gray-900 mt-1">{user?.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Created Date</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {user?.createdDate ? new Date(user.createdDate).toLocaleString() : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last Login</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {user?.lastLoginDate
                      ? new Date(user.lastLoginDate).toLocaleString()
                      : "Never"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Status</div>
                  <div className="flex items-center gap-2">
                    {user?.isActive ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Email Confirmed</div>
                  <div className="flex items-center gap-2">
                    {user?.emailConfirmed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Confirmed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">Not Confirmed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit Form */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <p className="mt-1 text-xs text-gray-500">2-50 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <p className="mt-1 text-xs text-gray-500">2-50 characters</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Changing email will require re-confirmation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as UserRole })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="BuildingManager">Building Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p>• <strong>Admin:</strong> Full access to all features</p>
                    <p>• <strong>Building Manager:</strong> Can manage buildings and analytics</p>
                    <p>• <strong>Viewer:</strong> Read-only access to public data</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
