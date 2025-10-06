import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Crown, Shield, User, MoreVertical, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  user_id: string;
  role: string;
  joined_at: string;
  username: string | null;
  avatar_url: string | null;
  email: string;
}

interface ParticipantListProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
  onParticipantRemoved?: () => void;
}

export function ParticipantList({
  conversationId,
  currentUserId,
  currentUserRole,
  onParticipantRemoved,
}: ParticipantListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchParticipants();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`participants-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchParticipants = async () => {
    try {
      const { data: participantData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, role, joined_at')
        .eq('conversation_id', conversationId)
        .is('left_at', null);

      if (participantsError) throw participantsError;
      if (!participantData || participantData.length === 0) {
        setParticipants([]);
        setLoading(false);
        return;
      }

      const userIds = participantData.map(p => p.user_id);

      const { data: userData, error: usersError } = await supabase
        .from('users_local')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      const combined = participantData.map(p => {
        const user = userData?.find(u => u.id === p.user_id);
        return {
          user_id: p.user_id,
          role: p.role,
          joined_at: p.joined_at,
          username: user?.username || null,
          avatar_url: user?.avatar_url || null,
          email: user?.email || '',
        };
      });

      setParticipants(combined);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system' as const,
        title: 'Removed from group chat',
        message: 'You have been removed from a group conversation',
        related_user_id: currentUserId,
      });

      toast({
        title: 'Member removed',
        description: 'The member has been removed from the group.',
      });

      onParticipantRemoved?.();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        title: 'Failed to remove member',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const canRemove = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 p-4">
        {participants.map((participant) => (
          <div
            key={participant.user_id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {participant.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {participant.username || 'Unknown'}
                  {participant.user_id === currentUserId && (
                    <span className="text-xs text-muted-foreground ml-2">(You)</span>
                  )}
                </p>
                {participant.role !== 'member' && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {getRoleIcon(participant.role)}
                    {participant.role}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
            </div>

            {canRemove && participant.user_id !== currentUserId && participant.role !== 'owner' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => removeParticipant(participant.user_id)}
                    className="text-destructive"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove from group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
