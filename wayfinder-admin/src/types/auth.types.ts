import { UserDto } from "./user.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Re-export UserDto as User for backward compatibility
export type { UserDto as User, UserRole } from "./user.types";
export type { UpdateUserCommand, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, RegisterUserRequest } from "./user.types";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

