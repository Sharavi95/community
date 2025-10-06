import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email: string;
}

interface Community {
  id: string;
  name: string;
  description: string | null;
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationModal({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCommunities();
      getCurrentUser();
      setSearchQuery('');
      setUsers([]);
    }
  }, [open]);

  const getCurrentUser = async () => {
    // Get user from localStorage since we're using custom auth
    const storedSession = localStorage.getItem('auth_session');
    if (storedSession) {
      try {
        const userData = JSON.parse(storedSession);
        setCurrentUserId(userData.id);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    }
  };

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_users', { 
        query,
        current_user_id: currentUserId 
      });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Search failed',
        description: 'Could not search for users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  }, [toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const fetchCommunities = async () => {
    try {
      if (!currentUserId) return;

      // Get communities where user is a member
      const { data: memberships } = await supabase
        .from('memberships')
        .select('community_id')
        .eq('user_id', currentUserId);

      if (!memberships || memberships.length === 0) {
        setCommunities([]);
        return;
      }

      const communityIds = memberships.map(m => m.community_id);

      const { data, error } = await supabase
        .from('communities')
        .select('id, name, description')
        .in('id', communityIds)
        .order('name');

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const createDirectConversation = async (otherUserId: string) => {
    if (!currentUserId) return;
    setLoading(true);

    try {
      // Check if a direct conversation already exists between these two users
      const { data: myConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (myConversations && myConversations.length > 0) {
        const conversationIds = myConversations.map(c => c.conversation_id);
        
        const { data: existingConvo } = await supabase
          .from('conversation_participants')
          .select('conversation_id, conversations!inner(type)')
          .eq('user_id', otherUserId)
          .in('conversation_id', conversationIds);

        const directConvo = existingConvo?.find(
          (c: any) => c.conversations.type === 'direct'
        );

        if (directConvo) {
          onConversationCreated(directConvo.conversation_id);
          onOpenChange(false);
          return;
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: currentUserId },
          { conversation_id: conversation.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      toast({
        title: 'Conversation created',
        description: 'You can now start messaging.',
      });

      onConversationCreated(conversation.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Failed to create conversation',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroupConversation = async (communityId: string) => {
    if (!currentUserId) return;
    setLoading(true);

    try {
      // Create new group conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'group', community_id: communityId })
        .select()
        .single();

      if (convError) throw convError;

      // Get all community members
      const { data: members } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('community_id', communityId);

      if (members) {
        const participants = members.map(m => ({
          conversation_id: conversation.id,
          user_id: m.user_id,
          role: m.user_id === currentUserId ? 'owner' : 'member',
        }));

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants);

        if (participantsError) throw participantsError;
      }

      toast({
        title: 'Group chat created',
        description: 'All community members can now participate.',
      });

      onConversationCreated(conversation.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating group conversation:', error);
      toast({
        title: 'Failed to create group chat',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Send a direct message or create a group chat
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Create Group</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <ScrollArea className="h-[300px]">
              {searching ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : users.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No users found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Start typing to search for users</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => createDirectConversation(user.id)}
                      disabled={loading}
                      className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">
                          {user.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                To create a group chat, use the "New Chat" button and select a community.
              </p>
              <p className="text-xs text-muted-foreground">
                Group chats are linked to communities for better organization.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
