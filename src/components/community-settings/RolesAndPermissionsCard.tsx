import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertCircle, Crown, Shield, User, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  joined_at: string;
  username: string;
  avatar_url: string | null;
  is_owner: boolean;
}

interface RolesAndPermissionsCardProps {
  communityId: string;
  isOwner: boolean;
  currentUserId: string;
  refreshKey?: number;
  onUpdate: () => void;
}

export function RolesAndPermissionsCard({
  communityId,
  isOwner,
  currentUserId,
  refreshKey,
  onUpdate,
}: RolesAndPermissionsCardProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [communityId, refreshKey]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch community to get owner
      const communityQuery = supabase
        .from('communities')
        .select('created_by')
        .eq('id', communityId)
        .maybeSingle();

      const [communityData] = await safeFetch(communityQuery);
      const ownerId = communityData?.created_by;

      // Fetch members
      const membersQuery = supabase
        .from('memberships')
        .select(`
          id,
          user_id,
          joined_at,
          users_local!memberships_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true });

      const [membersData, membersError] = await safeFetch(membersQuery);

      if (membersError) {
        setError('Failed to load members');
        setLoading(false);
        return;
      }

      if (membersData) {
        const formattedMembers: Member[] = membersData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          joined_at: item.joined_at,
          username: item.users_local?.username || 'Unknown',
          avatar_url: item.users_local?.avatar_url || null,
          is_owner: item.user_id === ownerId,
        }));
        setMembers(formattedMembers);
      }

      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !isOwner) return;

    setRemoving(true);

    const query = supabase
      .from('memberships')
      .delete()
      .eq('id', memberToRemove.id);

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to remove member');
    } else {
      toast.success('Member removed successfully');
      setMemberToRemove(null);
      fetchMembers();
      onUpdate();
    }

    setRemoving(false);
  };

  const getRoleBadge = (member: Member) => {
    if (member.is_owner) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          <Crown className="h-3 w-3 mr-1" />
          Owner
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
        <User className="h-3 w-3 mr-1" />
        Member
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchMembers}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-600 mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="border border-gray-100 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member)}
                  {isOwner &&
                    !member.is_owner &&
                    member.user_id !== currentUserId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.username} from this
              community? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removing ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
