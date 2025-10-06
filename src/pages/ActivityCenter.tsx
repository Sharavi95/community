import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function ActivityCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchNotifications();
    subscribeToNotifications();
  }, [user, navigate, refreshKey]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

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
      .limit(100);

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load notifications');
      setLoading(false);
      return;
    }

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
      .channel('activity-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    }
  };

  const filterByType = (type?: string) => {
    if (!type) return notifications;
    return notifications.filter((n) => n.type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
              <div className="border border-red-200 bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchNotifications}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                  Activity Center
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All your notifications and activity updates
                </p>
              </div>
            </div>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2 px-4 py-2 text-sm font-medium">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                <NotificationSettings />
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b border-gray-200 px-6">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentions"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Mentions
                  </TabsTrigger>
                  <TabsTrigger
                    value="moderation"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Moderation
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    System
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="p-6 m-0">
                {notifications.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => {}}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mentions" className="p-6 m-0">
                <div className="space-y-3">
                  {filterByType('mention').length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">No mentions</p>
                    </div>
                  ) : (
                    filterByType('mention').map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => {}}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="moderation" className="p-6 m-0">
                <div className="space-y-3">
                  {filterByType('moderation_alert').length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">No moderation alerts</p>
                    </div>
                  ) : (
                    filterByType('moderation_alert').map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => {}}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="system" className="p-6 m-0">
                <div className="space-y-3">
                  {filterByType('system').length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">No system notifications</p>
                    </div>
                  ) : (
                    filterByType('system').map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClose={() => {}}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
