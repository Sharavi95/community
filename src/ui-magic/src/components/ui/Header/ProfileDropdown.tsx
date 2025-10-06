import React, { useState } from 'react';
import { LogOutIcon, BellIcon, ChevronDownIcon, UserIcon } from 'lucide-react';
import { useAuth } from './context/AuthContext';
interface ProfileDropdownProps {
  onViewNotifications: () => void;
  unreadNotifications: number;
}
export function ProfileDropdown({
  onViewNotifications,
  unreadNotifications = 0
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const {
    user,
    logout,
    isLoading
  } = useAuth();
  // Generate initials from user name if no avatar is available
  const getInitials = () => {
    if (!user || !user.name) return '?';
    if (user.givenName && user.familyName) {
      return `${user.givenName.charAt(0)}${user.familyName.charAt(0)}`;
    }
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
    }
    return user.name.substring(0, 2).toUpperCase();
  };
  // Get user's first name for greeting
  const getFirstName = () => {
    if (!user) return '';
    return user.givenName || user.name.split(' ')[0];
  };
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsOpen(false);
  };
  // Show logout confirmation dialog
  const showLogoutConfirm = () => {
    setShowLogoutConfirmation(true);
  };
  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };
  // Handle logout
  const handleLogout = () => {
    closeDropdown();
    setShowLogoutConfirmation(false);
    logout();
  };
  // Navigate to user profile
  const navigateToUserProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    closeDropdown();
  };
  // If still loading user data, show loading state
  if (isLoading) {
    return <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="ml-2 w-16 h-4 bg-gray-200 animate-pulse"></div>
      </div>;
  }
  // If no user is authenticated, don't show the dropdown
  if (!user) {
    return null;
  }
  return <div className="relative">
      <button className="flex items-center" onClick={toggleDropdown} aria-label="User menu">
        <div className="relative w-10 h-10 rounded-full bg-white text-purple-700 flex items-center justify-center font-bold">
          {user.picture ? <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" /> : getInitials()}
          {unreadNotifications > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
        </div>
        <div className="flex items-center ml-2">
          <span className="hidden sm:inline text-white">
            Hi, {getFirstName()}
          </span>
          <ChevronDownIcon size={16} className="ml-1 text-white" />
        </div>
      </button>
      {isOpen && <>
          <div className="fixed inset-0 z-30" onClick={closeDropdown}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
            <div className="p-3 border-b border-gray-200">
              <button className="flex items-center w-full text-left hover:bg-gray-50 rounded-md transition-colors" onClick={navigateToUserProfile}>
                <UserIcon size={18} className="text-gray-500 mr-2" />
                <div className="ml-1">
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </button>
            </div>
            <div className="py-1">
              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={e => {
            e.preventDefault();
            closeDropdown();
            onViewNotifications();
          }}>
                <BellIcon size={16} className="mr-3 text-gray-500" />
                <span>Notifications</span>
                {unreadNotifications > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>}
              </button>
            </div>
            <div className="py-1 border-t border-gray-200">
              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={e => {
            e.preventDefault();
            showLogoutConfirm();
          }}>
                <LogOutIcon size={16} className="mr-3 text-gray-500" />
                Log Out
              </button>
            </div>
          </div>
        </>}
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to log out? You will need to sign in again
              to access your account.
            </p>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700" onClick={handleLogout}>
                Confirm
              </button>
            </div>
          </div>
        </div>}
    </div>;
}