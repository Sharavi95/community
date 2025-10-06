import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [open, user, refreshKey]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);

    const query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        link,
        is_read,
        created_at,
        users_local!notifications_related_user_id_fkey (
          username,
          avatar_url
        ),
        communities!notifications_community_id_fkey (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const [data] = await safeFetch(query);

    if (data) {
      const formattedNotifications: Notification[] = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        link: item.link,
        is_read: item.is_read,
        created_at: item.created_at,
        related_user: item.users_local,
        community: item.communities,
      }));
      setNotifications(formattedNotifications);
    }

    setLoading(false);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          toast.success('New notification received');
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    const query = supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    const [, error] = await safeFetch(query);

    if (!error) {
      toast.success('All notifications marked as read');
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    await safeFetch(query);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = async (id: string) => {
    const query = supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    const [, error] = await safeFetch(query);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    }
  };

  const groupedNotifications = {
    today: notifications.filter((n) => {
      const diff = Date.now() - new Date(n.created_at).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }),
    thisWeek: notifications.filter((n) => {
      const diff = Date.now() - new Date(n.created_at).getTime();
      return diff >= 24 * 60 * 60 * 1000 && diff < 7 * 24 * 60 * 60 * 1000;
    }),
    earlier: notifications.filter((n) => {
      const diff = Date.now() - new Date(n.created_at).getTime();
      return diff >= 7 * 24 * 60 * 60 * 1000;
    }),
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white">{unreadCount}</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllRead}
                className="gap-2 px-3 py-1 text-xs"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <>
              {groupedNotifications.today.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Today
                  </h3>
                  <div className="space-y-2">
                    {groupedNotifications.today.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => onOpenChange(false)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedNotifications.thisWeek.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    This Week
                  </h3>
                  <div className="space-y-2">
                    {groupedNotifications.thisWeek.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => onOpenChange(false)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Earlier
                  </h3>
                  <div className="space-y-2">
                    {groupedNotifications.earlier.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => onOpenChange(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
