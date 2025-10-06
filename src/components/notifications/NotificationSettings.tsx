import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquare, AtSign, AlertTriangle, Megaphone, Info } from 'lucide-react';

interface NotificationSettingsData {
  reply: boolean;
  mention: boolean;
  comment: boolean;
  moderation_alert: boolean;
  community_update: boolean;
  system: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    reply: true,
    mention: true,
    comment: true,
    moderation_alert: true,
    community_update: true,
    system: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const query = supabase
      .from('users_local')
      .select('notification_settings')
      .eq('id', user.id)
      .maybeSingle();

    const [data] = await safeFetch(query);

    if (data?.notification_settings) {
      setSettings(data.notification_settings as NotificationSettingsData);
    }

    setLoading(false);
  };

  const handleToggle = async (key: keyof NotificationSettingsData, value: boolean) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const query = supabase
      .from('users_local')
      .update({ notification_settings: newSettings })
      .eq('id', user.id);

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to update settings');
      setSettings(settings); // Revert on error
    } else {
      toast.success('Settings updated');
    }
  };

  const settingItems = [
    {
      key: 'reply' as keyof NotificationSettingsData,
      label: 'Replies',
      description: 'Get notified when someone replies to your posts',
      icon: MessageSquare,
      color: 'text-blue-600',
    },
    {
      key: 'mention' as keyof NotificationSettingsData,
      label: 'Mentions',
      description: 'Get notified when someone mentions you',
      icon: AtSign,
      color: 'text-purple-600',
    },
    {
      key: 'comment' as keyof NotificationSettingsData,
      label: 'Comments',
      description: 'Get notified about new comments on your posts',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      key: 'moderation_alert' as keyof NotificationSettingsData,
      label: 'Moderation Alerts',
      description: 'Get notified about moderation actions in your communities',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    {
      key: 'community_update' as keyof NotificationSettingsData,
      label: 'Community Updates',
      description: 'Get notified about important community announcements',
      icon: Megaphone,
      color: 'text-green-600',
    },
    {
      key: 'system' as keyof NotificationSettingsData,
      label: 'System Notifications',
      description: 'Get notified about system updates and features',
      icon: Info,
      color: 'text-gray-600',
    },
  ];

  if (loading) {
    return <div className="text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {settingItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`h-5 w-5 ${item.color} mt-0.5`} />
              <div>
                <Label htmlFor={item.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {item.label}
                </Label>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={settings[item.key]}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
            />
          </div>
        );
      })}
    </div>
  );
}
