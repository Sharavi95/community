import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users } from 'lucide-react';

interface Member {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface MemberListProps {
  communityId: string;
}

export function MemberList({ communityId }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [communityId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('memberships')
      .select(`
        user_id,
        users_local (
          id,
          username,
          avatar_url
        )
      `)
      .eq('community_id', communityId);

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load members');
      setLoading(false);
      return;
    }

    if (data) {
      const memberList = data
        .filter((m: any) => m.users_local)
        .map((m: any) => ({
          id: m.users_local.id,
          username: m.users_local.username,
          avatar_url: m.users_local.avatar_url,
        }));
      setMembers(memberList);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="shadow-[var(--shadow-soft)] border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-[var(--shadow-soft)] border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchMembers}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="shadow-[var(--shadow-soft)] border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-dashed border-2 border-border rounded-xl p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No members yet — be the first to join!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-soft)] border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(member.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {member.username || 'User'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
