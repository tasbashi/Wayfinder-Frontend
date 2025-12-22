"use client";

import { useState } from "react";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "../common/Button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { LogOut, User, Menu, Key, ChevronDown } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ChangePasswordModal } from "../features/ChangePasswordModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-30 lg:left-64">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            Wayfinder Admin
          </h1>
        </div>

        {/* Search bar - hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">
                  {user.firstName} {user.lastName}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {user.role}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Change Password
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="sm:hidden">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile search bar - shown below header on mobile */}
      <div className="md:hidden mt-3">
        <SearchBar />
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {
          handleLogout();
        }}
      />
    </header>
  );
}

