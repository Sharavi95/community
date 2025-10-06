import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ParticipantList } from './ParticipantList';
import { AddMemberModal } from './AddMemberModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Send, Users, User, UserPlus, LogOut, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  isOnline: boolean;
  onBack?: () => void; // For mobile back navigation
}

export function ChatWindow({ conversationId, isOnline, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [conversationInfo, setConversationInfo] = useState<any>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchConversationInfo();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          fetchSenderInfo(newMsg);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const fetchConversationInfo = async () => {
    try {
      // Get user from localStorage (using correct key)
      const userStr = localStorage.getItem('auth_session');
      console.log('[ChatWindow] Fetching conversation info, user from localStorage:', userStr);
      if (!userStr) {
        console.log('[ChatWindow] No user found in localStorage');
        return;
      }
      const user = JSON.parse(userStr);
      console.log('[ChatWindow] User ID:', user.id);

      // Get current user's role
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (participantData) {
        setCurrentUserRole(participantData.role || 'member');
      }

      const { data: conv } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          community_id,
          name,
          communities (name)
        `)
        .eq('id', conversationId)
        .single();

      if (conv?.type === 'direct') {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            users_local (id, username, avatar_url)
          `)
          .eq('conversation_id', conversationId)
          .neq('user_id', user.id);

        setConversationInfo({
          type: 'direct',
          other_user: participants?.[0]?.users_local,
        });
      } else if (conv?.type === 'group') {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            users_local (id, username, avatar_url)
          `)
          .eq('conversation_id', conversationId)
          .is('left_at', null);

        setConversationInfo({
          type: 'group',
          community_id: conv.community_id,
          name: conv.name, // Group name
          community_name: conv.communities?.name, // Community name (for badge)
          participants: participants?.map(p => p.users_local) || [],
        });
      }
    } catch (error) {
      console.error('Error fetching conversation info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      // Get user from localStorage (using correct key)
      const userStr = localStorage.getItem('auth_session');
      console.log('[ChatWindow] Fetching messages, user from localStorage:', userStr);
      if (!userStr) {
        console.log('[ChatWindow] No user found in localStorage for fetchMessages');
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      console.log('[ChatWindow] Setting current user ID:', user.id);
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users_local!messages_sender_id_fkey (id, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('[ChatWindow] Messages fetched:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('[ChatWindow] Error fetching messages:', error);
      toast({
        title: 'Error loading messages',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      console.log('[ChatWindow] Setting loading to false');
      setLoading(false);
    }
  };

  const fetchSenderInfo = async (message: Message) => {
    const { data: sender } = await supabase
      .from('users_local')
      .select('id, username, avatar_url')
      .eq('id', message.sender_id)
      .single();

    setMessages(prev => [...prev, { ...message, sender }]);
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId) return;

    const unreadMessages = messages.filter(
      m => !m.is_read && m.sender_id !== currentUserId
    );

    if (unreadMessages.length === 0) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', unreadMessages.map(m => m.id));
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !isOnline) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: messageContent,
      });

      if (error) throw error;

      // Trigger notification for other participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', currentUserId);

      if (participants) {
        const notificationPromises = participants.map(p =>
          supabase.from('notifications').insert({
            user_id: p.user_id,
            type: 'comment',
            title: 'New message',
            message: `You have a new message: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
            link: '/messages',
            related_user_id: currentUserId,
          })
        );
        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const leaveGroup = async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: 'Left group',
        description: 'You have left this group conversation.',
      });

      window.location.href = '/messages';
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Failed to leave group',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteGroup = async () => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: 'Group deleted',
        description: 'The group has been permanently deleted.',
      });

      window.location.href = '/messages';
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Failed to delete group',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }


  const canManageGroup = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversationInfo?.other_user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {conversationInfo?.type === 'direct' ? (
                conversationInfo.other_user?.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />
              ) : (
                <Users className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {conversationInfo?.type === 'direct'
                ? conversationInfo.other_user?.username || 'Unknown User'
                : conversationInfo?.name || 'Group Chat'}
              {conversationInfo?.type === 'group' && conversationInfo?.community_name && (
                <Badge variant="secondary" className="text-xs">
                  {conversationInfo.community_name}
                </Badge>
              )}
            </h3>
            {conversationInfo?.type === 'group' && (
              <p className="text-xs text-muted-foreground">
                {conversationInfo.participants?.length || 0} members
              </p>
            )}
          </div>
        </div>

        {conversationInfo?.type === 'group' && (
          <div className="flex items-center gap-2">
            {canManageGroup && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMemberOpen(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Members
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Group Members</SheetTitle>
                  <SheetDescription>
                    Manage participants in this group chat
                  </SheetDescription>
                </SheetHeader>
                <ParticipantList
                  conversationId={conversationId}
                  currentUserId={currentUserId || ''}
                  currentUserRole={currentUserRole}
                  onParticipantRemoved={fetchConversationInfo}
                />
              </SheetContent>
            </Sheet>

            {currentUserRole !== 'owner' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Leave
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave group?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will no longer receive messages from this group. You can be added back by an admin.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={leaveGroup} className="bg-destructive">
                      Leave Group
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete group?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the group and all its messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteGroup} className="bg-destructive">
                      Delete Group
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <div className="rounded-full bg-muted p-4 inline-flex mb-3">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to send a message
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isOnline ? "Type a message..." : "Offline - messages will send when online"}
            disabled={!isOnline || sending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() || !isOnline || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {conversationInfo?.type === 'group' && (
        <AddMemberModal
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          conversationId={conversationId}
          communityId={conversationInfo.community_id}
        />
      )}
    </div>
  );
}
