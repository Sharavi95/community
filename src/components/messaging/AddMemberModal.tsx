import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Member {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  email: string;
}

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  communityId: string | null;
}

export function AddMemberModal({
  open,
  onOpenChange,
  conversationId,
  communityId,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && communityId) {
      fetchAvailableMembers();
      getCurrentUser();
    }
  }, [open, communityId, conversationId]);

  const getCurrentUser = async () => {
    // Get user from localStorage (using correct key)
    const userStr = localStorage.getItem('auth_session');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }
  };

  const fetchAvailableMembers = async () => {
    if (!communityId) return;

    try {
      // Get existing participants
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .is('left_at', null);

      const existingUserIds = existingParticipants?.map(p => p.user_id) || [];

      // Get community members
      const { data: memberships } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('community_id', communityId);

      if (!memberships || memberships.length === 0) return;

      const communityUserIds = memberships.map(m => m.user_id);
      const availableUserIds = communityUserIds.filter(id => !existingUserIds.includes(id));

      if (availableUserIds.length === 0) {
        setAvailableMembers([]);
        return;
      }

      const { data: users } = await supabase
        .from('users_local')
        .select('id, username, avatar_url, email')
        .in('id', availableUserIds);

      const formattedMembers = users?.map(u => ({
        user_id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        email: u.email,
      })) || [];

      setAvailableMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching available members:', error);
    }
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const addMembers = async () => {
    if (selectedMembers.size === 0 || !currentUserId) return;
    setLoading(true);

    try {
      const participants = Array.from(selectedMembers).map(userId => ({
        conversation_id: conversationId,
        user_id: userId,
        role: 'member',
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Create notifications
      const notifications = Array.from(selectedMembers).map(userId => ({
        user_id: userId,
        type: 'community_update' as const,
        title: 'Added to group chat',
        message: 'You\'ve been added to a group conversation',
        link: `/messages?conversation=${conversationId}`,
        community_id: communityId,
        related_user_id: currentUserId,
      }));

      await supabase.from('notifications').insert(notifications);

      toast({
        title: 'Members added',
        description: `${selectedMembers.size} member(s) added successfully.`,
      });

      onOpenChange(false);
      setSelectedMembers(new Set());
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: 'Failed to add members',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = availableMembers.filter(m =>
    m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Select community members to add to this group chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {availableMembers.length === 0
                    ? 'All community members are already in this chat'
                    : 'No members found'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      checked={selectedMembers.has(member.user_id)}
                      onCheckedChange={() => toggleMember(member.user_id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.username || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={addMembers}
              disabled={loading || selectedMembers.size === 0}
            >
              {loading ? 'Adding...' : `Add ${selectedMembers.size || ''} Member${selectedMembers.size === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
