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
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: string;
  name: string;
  description: string | null;
}

interface Member {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  email: string;
}

interface GroupChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (conversationId: string) => void;
}

export function GroupChatModal({
  open,
  onOpenChange,
  onGroupCreated,
}: GroupChatModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      getCurrentUser();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (currentUserId) {
      fetchCommunities();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityMembers(selectedCommunity);
    }
  }, [selectedCommunity]);

  const resetForm = () => {
    setStep(1);
    setSelectedCommunity(null);
    setGroupName('');
    setSelectedMembers(new Set());
    setMembers([]);
  };

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

  const fetchCommunities = async () => {
    try {
      if (!currentUserId) {
        console.log('[GroupChatModal] No currentUserId for fetchCommunities');
        return;
      }

      console.log('[GroupChatModal] Fetching communities for user:', currentUserId);
      const { data: memberships } = await supabase
        .from('memberships')
        .select('community_id')
        .eq('user_id', currentUserId);

      console.log('[GroupChatModal] Memberships:', memberships);
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
      console.log('[GroupChatModal] Communities fetched:', data);
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchCommunityMembers = async (communityId: string) => {
    try {
      console.log('[GroupChatModal] Fetching members for community:', communityId);
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('community_id', communityId);

      console.log('[GroupChatModal] Memberships for community:', memberships);
      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) {
        console.log('[GroupChatModal] No memberships found');
        setMembers([]);
        return;
      }

      const userIds = memberships.map(m => m.user_id);
      console.log('[GroupChatModal] Fetching users:', userIds);

      const { data: users, error: usersError } = await supabase
        .from('users_local')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      console.log('[GroupChatModal] Users fetched:', users);
      if (usersError) throw usersError;

      const formattedMembers = users?.map(u => ({
        user_id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        email: u.email,
      })) || [];

      console.log('[GroupChatModal] Formatted members:', formattedMembers);
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
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

  const createGroupChat = async () => {
    if (!currentUserId || !selectedCommunity || !groupName.trim()) return;
    setLoading(true);

    try {
      // Create conversation with group name
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'group',
          community_id: selectedCommunity,
          name: groupName.trim(), // Store the group name
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add creator as owner
      const participants = [
        { conversation_id: conversation.id, user_id: currentUserId, role: 'owner' },
        ...Array.from(selectedMembers).map(userId => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'member',
        })),
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Create notifications for added members
      const notifications = Array.from(selectedMembers).map(userId => ({
        user_id: userId,
        type: 'community_update' as const,
        title: 'Added to group chat',
        message: `You've been added to ${groupName}`,
        link: `/messages?conversation=${conversation.id}`,
        community_id: selectedCommunity,
        related_user_id: currentUserId,
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      toast({
        title: 'Group chat created',
        description: `${groupName} has been created successfully.`,
      });

      onGroupCreated(conversation.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: 'Failed to create group chat',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedCommunity) {
      toast({
        title: 'Select a community',
        description: 'Please select a community to continue.',
        variant: 'destructive',
      });
      return;
    }
    if (step === 2 && !groupName.trim()) {
      toast({
        title: 'Enter group name',
        description: 'Please enter a name for the group.',
        variant: 'destructive',
      });
      return;
    }
    setStep(step + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Group Chat - Step {step} of 3</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose a community for your group chat'}
            {step === 2 && 'Give your group a name'}
            {step === 3 && 'Select members to add'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <ScrollArea className="h-[300px]">
              {communities.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No communities found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community.id)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedCommunity === community.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{community.name}</p>
                        {community.description && (
                          <p className="text-xs opacity-80 truncate">{community.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <ScrollArea className="h-[300px]">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No members found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members
                    .filter(m => m.user_id !== currentUserId)
                    .map((member) => (
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
          )}

          <div className="flex gap-2 justify-end">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={createGroupChat} disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
