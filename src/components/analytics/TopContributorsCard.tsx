import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface Contributor {
  user_id: string;
  username: string;
  avatar_url: string | null;
  contribution_count: number;
}

interface TopContributorsCardProps {
  communityIds: string[];
  refreshKey?: number;
}

export function TopContributorsCard({
  communityIds,
  refreshKey,
}: TopContributorsCardProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopContributors();
  }, [communityIds, refreshKey]);

  const fetchTopContributors = async () => {
    if (communityIds.length === 0) return;

    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Fetch posts
      const postsQuery = supabase
        .from('posts')
        .select('created_by')
        .in('community_id', communityIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'active');

      // Fetch comments
      const commentsQuery = supabase
        .from('comments')
        .select('created_by, post_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'active');

      const [postsData, commentsData] = await Promise.all([
        safeFetch(postsQuery),
        safeFetch(commentsQuery),
      ]);

      // Get post IDs in our communities
      const postsInCommunitiesQuery = supabase
        .from('posts')
        .select('id')
        .in('community_id', communityIds);
      
      const [postsInCommunities] = await safeFetch(postsInCommunitiesQuery);
      const postIds = new Set(postsInCommunities?.map((p: any) => p.id) || []);

      // Count contributions per user
      const contributionMap = new Map<string, number>();

      if (postsData[0]) {
        postsData[0].forEach((post: any) => {
          const count = contributionMap.get(post.created_by) || 0;
          contributionMap.set(post.created_by, count + 1);
        });
      }

      if (commentsData[0]) {
        commentsData[0]
          .filter((comment: any) => postIds.has(comment.post_id))
          .forEach((comment: any) => {
            const count = contributionMap.get(comment.created_by) || 0;
            contributionMap.set(comment.created_by, count + 1);
          });
      }

      // Get top 5 contributors
      const topUserIds = Array.from(contributionMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([userId]) => userId);

      if (topUserIds.length > 0) {
        // Fetch user details
        const usersQuery = supabase
          .from('users_local')
          .select('id, username, avatar_url')
          .in('id', topUserIds);

        const [usersData] = await safeFetch(usersQuery);

        if (usersData) {
          const topContributors: Contributor[] = usersData.map((user: any) => ({
            user_id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            contribution_count: contributionMap.get(user.id) || 0,
          })).sort((a, b) => b.contribution_count - a.contribution_count);

          setContributors(topContributors);
        }
      }
    } catch (err) {
      console.error('Failed to fetch top contributors:', err);
    }

    setLoading(false);
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
        <h2 className="text-lg font-bold text-gray-900">Top Contributors</h2>
        <p className="text-sm text-gray-600 mt-1">Most active members (30 days)</p>
      </div>
      <div className="p-6">
        {contributors.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">No contributors yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map((contributor, index) => (
              <Link
                key={contributor.user_id}
                to="/profile"
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contributor.avatar_url || undefined} />
                    <AvatarFallback>
                      {contributor.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-amber-100 rounded-full p-1">
                      <Trophy className="h-3 w-3 text-amber-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contributor.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {contributor.contribution_count} contributions
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  #{index + 1}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
