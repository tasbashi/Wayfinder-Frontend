/**
 * User Management Service
 * Based on API-USER-MANAGEMENT-REFERENCE.md
 */

import { apiClient } from "./client";
import { ServiceResponse, PaginatedList } from "../types/api.types";
import {
  UserDto,
  UserListFilters,
  UpdateUserCommand,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterUserRequest,
} from "../types/user.types";

export class UserService {
  /**
   * Get all users with pagination and filters (Admin only)
   * GET /api/users
   */
  static async getAll(filters?: UserListFilters): Promise<PaginatedList<UserDto>> {
    const params = new URLSearchParams();
    
    if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
    if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);

    const response = await apiClient.get<ServiceResponse<PaginatedList<UserDto>>>(
      `/api/users?${params.toString()}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch users");
  }

  /**
   * Get user by ID (Admin only)
   * GET /api/users/{id}
   */
  static async getById(id: string): Promise<UserDto> {
    const response = await apiClient.get<ServiceResponse<UserDto>>(
      `/api/users/${id}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch user");
  }

  /**
   * Update user (Admin only)
   * PUT /api/users/{id}
   */
  static async update(id: string, command: UpdateUserCommand): Promise<boolean> {
    const response = await apiClient.put<ServiceResponse<boolean>>(
      `/api/users/${id}`,
      command
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to update user");
  }

  /**
   * Delete user - soft delete (Admin only)
   * DELETE /api/users/{id}
   */
  static async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ServiceResponse<boolean>>(
      `/api/users/${id}`
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to delete user");
  }

  /**
   * Activate user (Admin only)
   * PATCH /api/users/{id}/activate
   */
  static async activate(id: string): Promise<boolean> {
    const response = await apiClient.patch<ServiceResponse<boolean>>(
      `/api/users/${id}/activate`
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to activate user");
  }

  /**
   * Deactivate user (Admin only)
   * PATCH /api/users/{id}/deactivate
   */
  static async deactivate(id: string): Promise<boolean> {
    const response = await apiClient.patch<ServiceResponse<boolean>>(
      `/api/users/${id}/deactivate`
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to deactivate user");
  }

  /**
   * Register new user (Admin only)
   * POST /api/auth/register
   */
  static async register(request: RegisterUserRequest): Promise<string> {
    const response = await apiClient.post<ServiceResponse<string>>(
      "/api/auth/register",
      request
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to register user");
  }

  /**
   * Change password (Authenticated users)
   * POST /api/auth/change-password
   */
  static async changePassword(request: ChangePasswordRequest): Promise<boolean> {
    const response = await apiClient.post<ServiceResponse<boolean>>(
      "/api/auth/change-password",
      request
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to change password");
  }

  /**
   * Forgot password (Public)
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(request: ForgotPasswordRequest): Promise<boolean> {
    const response = await apiClient.post<ServiceResponse<boolean>>(
      "/api/auth/forgot-password",
      request
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to send reset email");
  }

  /**
   * Reset password (Public)
   * POST /api/auth/reset-password
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<boolean> {
    const response = await apiClient.post<ServiceResponse<boolean>>(
      "/api/auth/reset-password",
      request
    );

    if (response.data.isSuccess) {
      return response.data.data ?? true;
    }

    throw new Error(response.data.errorMessage || "Failed to reset password");
  }
}

