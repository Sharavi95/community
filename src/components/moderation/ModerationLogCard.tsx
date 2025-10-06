import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, UserPlus, UserMinus, Trash2 } from 'lucide-react';

interface ModerationAction {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  moderator_username: string;
}

interface ModerationLogCardProps {
  communityIds: string[];
  refreshKey?: number;
}

export function ModerationLogCard({
  communityIds,
  refreshKey,
}: ModerationLogCardProps) {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, [communityIds, refreshKey]);

  const fetchActions = async () => {
    if (communityIds.length === 0) return;

    setLoading(true);

    const query = supabase
      .from('moderation_actions')
      .select(`
        id,
        action_type,
        description,
        created_at,
        users_local!moderation_actions_moderator_id_fkey (
          username
        )
      `)
      .in('community_id', communityIds)
      .order('created_at', { ascending: false })
      .limit(10);

    const [data] = await safeFetch(query);

    if (data) {
      const formattedActions: ModerationAction[] = data.map((item: any) => ({
        id: item.id,
        action_type: item.action_type,
        description: item.description,
        created_at: item.created_at,
        moderator_username: item.users_local?.username || 'Unknown',
      }));
      setActions(formattedActions);
    }

    setLoading(false);
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('delete')) {
      return <Trash2 className="h-4 w-4 text-red-600" />;
    }
    if (actionType.includes('resolved')) {
      return <Edit className="h-4 w-4 text-green-600" />;
    }
    if (actionType.includes('dismissed')) {
      return <UserMinus className="h-4 w-4 text-gray-600" />;
    }
    return <Edit className="h-4 w-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Recent Actions</h2>
        <p className="text-sm text-gray-600 mt-1">Latest moderation activity</p>
      </div>
      <div className="p-6">
        {actions.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">No moderation actions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getActionIcon(action.action_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{action.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        by {action.moderator_username}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        {format(new Date(action.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
