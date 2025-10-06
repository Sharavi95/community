import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  AtSign,
  AlertTriangle,
  Info,
  Megaphone,
  X,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  related_user: {
    username: string;
    avatar_url: string | null;
  } | null;
  community: {
    name: string;
  } | null;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'reply':
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-600" />;
      case 'moderation_alert':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'community_update':
        return <Megaphone className="h-4 w-4 text-green-600" />;
      case 'system':
        return <Info className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative block border rounded-lg p-4 transition-colors hover:border-gray-300 cursor-pointer ${
        notification.is_read
          ? 'border-gray-100 bg-white'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {notification.related_user && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.related_user.avatar_url || undefined} />
            <AvatarFallback>
              {notification.related_user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {notification.community && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 text-xs"
                  >
                    {notification.community.name}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="h-6 w-6 p-0 hover:bg-red-50"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
        </Button>
      </div>
      {notification.link && (
        <Link to={notification.link} className="absolute inset-0" aria-label="View notification" />
      )}
    </div>
  );
}
