import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  community_id: string | null;
  created_at: string;
  name?: string; // Group name for group chats
  other_user?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  community?: {
    name: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  participant_count?: number;
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
}

export function ConversationList({ selectedConversationId, onSelectConversation, refreshTrigger }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    
    const channel = supabase
      .channel('conversation-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const fetchConversations = async () => {
    try {
      // Get user from localStorage since we're using custom auth
      const storedSession = localStorage.getItem('auth_session');
      if (!storedSession) return;
      
      const userData = JSON.parse(storedSession);
      setCurrentUserId(userData.id);

      // Get conversations the user is part of
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userData.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get conversation details
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          community_id,
          created_at,
          name,
          communities (name)
        `)
        .in('id', conversationIds)
        .order('created_at', { ascending: false });

      if (convError) throw convError;

      // Get participants for each conversation
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get other participants
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              users_local (id, username, avatar_url)
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', userData.id);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userData.id);

          const otherUser = participants?.[0]?.users_local;

          return {
            id: conv.id,
            type: conv.type,
            community_id: conv.community_id,
            created_at: conv.created_at,
            name: conv.name, // Include group name
            other_user: otherUser ? {
              id: otherUser.id,
              username: otherUser.username,
              avatar_url: otherUser.avatar_url,
            } : undefined,
            community: conv.communities ? { name: conv.communities.name } : undefined,
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
            participant_count: (participants?.length || 0) + 1,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (conv.type === 'direct' && conv.other_user?.username) {
      return conv.other_user.username.toLowerCase().includes(query);
    }
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(query) || 
             conv.community?.name.toLowerCase().includes(query);
    }
    return false;
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-10 w-full mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="rounded-full bg-muted p-4 inline-flex mb-3">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
            <p className="text-xs text-muted-foreground">
              Start a new conversation to get started
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-accent/50 transition-colors ${
                  selectedConversationId === conv.id ? 'bg-accent' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conv.type === 'direct' ? (
                        conv.other_user?.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unread_count > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {conv.type === 'direct' 
                        ? conv.other_user?.username || 'Unknown User'
                        : conv.name || 'Group Chat'}
                    </p>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message?.content || 'No messages yet'}
                  </p>
                  {conv.type === 'group' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.participant_count} members
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
