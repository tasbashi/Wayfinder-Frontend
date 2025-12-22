"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { RegisterUserRequest, UserRole } from "@/types/user.types";
import { UserService } from "@/api/user.service";
import { useToastContext } from "@/contexts/ToastContext";

export default function CreateUserPage() {
  const router = useRouter();
  const { success, error: showError } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegisterUserRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "Viewer",
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push("Password must be at least 12 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Must contain at least one special character");
    }
    
    return errors;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordErrors(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      showError("Please fix password validation errors");
      return;
    }

    try {
      setIsLoading(true);
      await UserService.register(formData);
      success("User created successfully");
      router.push("/users");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
              <p className="mt-2 text-gray-600">Add a new user to the system</p>
            </div>
          </div>

          <Card className="max-w-2xl p-6">
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
                    placeholder="John"
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
                    placeholder="Doe"
                  />
                  <p className="mt-1 text-xs text-gray-500">2-50 characters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  User will receive a confirmation email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
                  <ul className="text-xs space-y-0.5">
                    <li className={formData.password.length >= 12 ? "text-green-600" : "text-gray-500"}>
                      ✓ At least 12 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                      ✓ One uppercase letter (A-Z)
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                      ✓ One lowercase letter (a-z)
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                      ✓ One number (0-9)
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                      ✓ One special character (!@#$%^&*)
                    </li>
                  </ul>
                  {passwordErrors.length > 0 && formData.password && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      {passwordErrors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
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
                  <p>• <strong>Admin:</strong> Full access to all features including user management</p>
                  <p>• <strong>Building Manager:</strong> Can manage buildings, floors, nodes, and view analytics</p>
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
                <Button type="submit" disabled={isLoading || passwordErrors.length > 0}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

