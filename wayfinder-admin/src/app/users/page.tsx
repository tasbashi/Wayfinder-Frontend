"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
  Search,
  UserPlus,
  Shield,
  ShieldAlert,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UserDto, UserRole } from "@/types/user.types";
import { UserService } from "@/api/user.service";
import { useToastContext } from "@/contexts/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function UsersPage() {
  const router = useRouter();
  const { success, error: showError } = useToastContext();
  
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadUsers();
  }, [pageNumber, debouncedSearch, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        pageNumber,
        pageSize,
        searchTerm: debouncedSearch || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      };

      const result = await UserService.getAll(filters);
      setUsers(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, fullName: string) => {
    if (!confirm(`Are you sure you want to delete ${fullName}? This will deactivate the user.`)) {
      return;
    }

    try {
      await UserService.delete(id);
      success("User deleted successfully");
      loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      showError(errorMessage);
    }
  };

  const handleActivate = async (id: string, fullName: string) => {
    try {
      await UserService.activate(id);
      success(`${fullName} activated successfully`);
      loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to activate user";
      showError(errorMessage);
    }
  };

  const handleDeactivate = async (id: string, fullName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${fullName}?`)) {
      return;
    }

    try {
      await UserService.deactivate(id);
      success(`${fullName} deactivated successfully`);
      loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to deactivate user";
      showError(errorMessage);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      Admin: "bg-purple-100 text-purple-800",
      BuildingManager: "bg-blue-100 text-blue-800",
      Viewer: "bg-gray-100 text-gray-800",
    };

    const icons = {
      Admin: ShieldAlert,
      BuildingManager: Shield,
      Viewer: null,
    };

    const Icon = icons[role];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {role}
      </span>
    );
  };

  if (isLoading && users.length === 0) {
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

  return (
    <ProtectedRoute requiredRole="Admin">
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-2 text-gray-600">
                Manage system users and their roles • {totalCount} total users
              </p>
            </div>
            <Button onClick={() => router.push("/users/create")}>
              <UserPlus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>

          {error && (
            <ErrorMessage
              message={error}
              onRetry={loadUsers}
            />
          )}

          <Card className="p-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="BuildingManager">Building Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "inactive")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Last Login</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {!user.emailConfirmed && (
                              <div className="text-xs text-orange-600 mt-0.5">
                                Email not confirmed
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.lastLoginDate
                          ? new Date(user.lastLoginDate).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/users/${user.id}`)}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(user.id, user.fullName)}
                              title="Deactivate user"
                            >
                              <UserX className="w-4 h-4 text-orange-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(user.id, user.fullName)}
                              title="Activate user"
                            >
                              <UserCheck className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.fullName)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500">
                  No users found. Try adjusting your filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Page {pageNumber} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
