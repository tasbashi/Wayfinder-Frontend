"use client";

import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Key, Eye, EyeOff } from "lucide-react";
import { ChangePasswordRequest } from "@/types/user.types";
import { UserService } from "@/api/user.service";
import { useToastContext } from "@/contexts/ToastContext";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const { success, error: showError } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<ChangePasswordRequest & { confirmPassword: string }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  const handleNewPasswordChange = (password: string) => {
    setFormData({ ...formData, newPassword: password });
    setPasswordErrors(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const errors = validatePassword(formData.newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      showError("Please fix password validation errors");
      return;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    // Check if new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      showError("New password must be different from current password");
      return;
    }

    try {
      setIsLoading(true);
      await UserService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      success("Password changed successfully. Please login again.");
      
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors([]);
      
      onSuccess?.();
      onClose();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              required
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              required
              placeholder="Enter a strong password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
            <ul className="text-xs space-y-0.5">
              <li className={formData.newPassword.length >= 12 ? "text-green-600" : "text-gray-500"}>
                ✓ At least 12 characters
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}>
                ✓ One uppercase letter (A-Z)
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}>
                ✓ One lowercase letter (a-z)
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}>
                ✓ One number (0-9)
              </li>
              <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}>
                ✓ One special character (!@#$%^&*)
              </li>
            </ul>
            {passwordErrors.length > 0 && formData.newPassword && (
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
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              placeholder="Re-enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ After changing your password, you will be logged out and need to login again.
          </p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading ||
              passwordErrors.length > 0 ||
              formData.newPassword !== formData.confirmPassword ||
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.confirmPassword
            }
          >
            <Key className="w-4 h-4 mr-2" />
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

