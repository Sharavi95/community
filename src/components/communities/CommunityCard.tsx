import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Eye, UserPlus, UserMinus, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
  };
  isJoined: boolean;
  onJoinLeave: () => void;
}

export function CommunityCard({ community, isJoined, onJoinLeave }: CommunityCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to join communities');
      return;
    }

    setLoading(true);

    if (isJoined) {
      // Leave community
      const query = supabase
        .from('memberships')
        .delete()
        .match({ user_id: user.id, community_id: community.id });

      const [, error] = await safeFetch(query);

      if (error) {
        toast.error('Failed to leave community');
      } else {
        toast.success('Left community');
        onJoinLeave();
      }
    } else {
      // Join community
      const query = supabase.from('memberships').insert({
        user_id: user.id,
        community_id: community.id,
      });

      const [, error] = await safeFetch(query);

      if (error) {
        toast.error('Failed to join community');
      } else {
        toast.success('Joined community!');
        onJoinLeave();
      }
    }

    setLoading(false);
  };

  const JoinButton = () => {
    if (!user) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Join
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Login to join communities</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (isJoined) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={handleJoinLeave}
          disabled={loading}
          className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Joined
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={handleJoinLeave}
        disabled={loading}
        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Join
      </Button>
    );
  };

  return (
    <Card className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elegant)] transition-all h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            {community.name}
          </CardTitle>
          {isJoined && user && (
            <Badge className="bg-gradient-to-r from-primary to-accent text-xs">
              Member
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3 min-h-[3rem]">
          {community.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <Users className="h-3 w-3" />
          <span>{community.member_count || 0} members</span>
        </div>
        <div className="flex gap-2">
          <JoinButton />
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/community/${community.id}`)}
            className="gap-2 flex-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
