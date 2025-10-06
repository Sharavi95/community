import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangleIcon, MessageSquareIcon, BellIcon, ChevronRightIcon } from 'lucide-react';
interface NotificationItemProps {
  id: string;
  type: 'critical' | 'message' | 'update';
  message: string;
  time: string;
  read: boolean;
  actionUrl: string;
  category?: string;
  onMarkAsRead?: (id: string) => void;
  expanded?: boolean;
}
export function NotificationItem({
  id,
  type,
  message,
  time,
  read,
  actionUrl,
  category,
  onMarkAsRead,
  expanded = false
}: NotificationItemProps) {
  // Format the time as "X time ago"
  const formattedTime = formatDistanceToNow(new Date(time), {
    addSuffix: true
  });
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'critical':
        return <AlertTriangleIcon size={16} className="text-red-500" />;
      case 'message':
        return <MessageSquareIcon size={16} className="text-blue-500" />;
      case 'update':
        return <BellIcon size={16} className="text-gray-500" />;
      default:
        return <BellIcon size={16} className="text-gray-500" />;
    }
  };
  // Handle click on notification
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Mark as read if unread
    if (onMarkAsRead && !read) {
      onMarkAsRead(id);
    }
  };
  return <button className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!read ? 'bg-blue-50' : ''}`} onClick={handleClick}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <p className={`text-sm ${!read ? 'font-semibold' : 'font-normal'} text-gray-800`}>
              {message}
            </p>
            {!expanded && <ChevronRightIcon size={16} className="text-gray-400 ml-2 flex-shrink-0" />}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">{formattedTime}</p>
            {expanded && category && <span className={`text-xs px-2 py-0.5 rounded-full ${type === 'critical' ? 'bg-red-100 text-red-800' : type === 'message' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {category}
              </span>}
          </div>
        </div>
      </div>
    </button>;
}