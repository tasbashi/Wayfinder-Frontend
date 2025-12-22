/**
 * User Management Types
 * Based on API-USER-MANAGEMENT-REFERENCE.md
 */

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  emailConfirmed: boolean;
  createdDate: string;
  lastLoginDate?: string;
}

export type UserRole = "Admin" | "BuildingManager" | "Viewer";

/**
 * User list filter parameters
 */
export interface UserListFilters {
  pageNumber?: number;
  pageSize?: number;
  role?: UserRole;
  isActive?: boolean;
  searchTerm?: string;
}

/**
 * Update user command
 */
export interface UpdateUserCommand {
  firstName: string;
  lastName: string;
  email?: string;
  role?: UserRole;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * Register user request (Admin only)
 */
export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

