import React, { useEffect, useState } from 'react';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { mockNotifications, Notification } from '../utils/mockNotifications';
interface NotificationsMenuProps {
  onViewAll: () => void;
  onClose: () => void;
}
export function NotificationsMenu({
  onViewAll,
  onClose
}: NotificationsMenuProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch notifications
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 300);
  }, []);
  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.read).length;
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => notif.id === id ? {
      ...notif,
      read: true
    } : notif));
  };
  // Mark all notifications as read
  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(notif => ({
      ...notif,
      read: true
    })));
  };
  // Handle view all click
  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    onViewAll();
  };
  // Loading state
  if (loading) {
    return <div className="fixed right-4 top-16 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
        <div className="fixed inset-0 z-30" onClick={onClose}></div>
        <div className="relative z-40">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          </div>
          <div className="p-4 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        </div>
      </div>;
  }
  // Error state
  if (error) {
    return <div className="fixed right-4 top-16 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
        <div className="fixed inset-0 z-30" onClick={onClose}></div>
        <div className="relative z-40">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm text-red-500 mb-2">
              Failed to load notifications
            </p>
            <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>;
  }
  return <div className="fixed right-4 top-16 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
      <div className="fixed inset-0 z-30" onClick={onClose}></div>
      <div className="relative z-40">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          {unreadCount > 0 && <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center" onClick={markAllAsRead}>
              <CheckIcon size={12} className="mr-1" />
              Mark all as read
            </button>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? notifications.slice(0, 5).map(notification => <NotificationItem key={notification.id} {...notification} onMarkAsRead={markAsRead} />) : <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>}
        </div>
        <div className="p-2 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 flex items-center justify-center" onClick={handleViewAll}>
            View all notifications <ArrowRightIcon size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>;
}