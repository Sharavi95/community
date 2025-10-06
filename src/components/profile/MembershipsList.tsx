import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, ExternalLink } from 'lucide-react';

interface Membership {
  id: string;
  joined_at: string;
  community: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface MembershipsListProps {
  userId: string;
}

export function MembershipsList({ userId }: MembershipsListProps) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, [userId]);

  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('memberships')
      .select(`
        id,
        joined_at,
        communities!memberships_community_id_fkey (
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load communities');
      setLoading(false);
      return;
    }

    if (data) {
      const formattedData = data.map((item: any) => ({
        id: item.id,
        joined_at: item.joined_at,
        community: item.communities,
      }));
      setMemberships(formattedData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6 space-y-3">
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
            <Button variant="secondary" size="sm" onClick={fetchMemberships}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">My Communities</h2>
        </div>
        <div className="p-6">
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              You haven't joined any communities yet
            </p>
            <Link to="/communities">
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 px-4 py-2 text-sm font-medium"
              >
                Explore Communities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">My Communities</h2>
        <p className="text-sm text-gray-600 mt-1">
          {memberships.length} {memberships.length === 1 ? 'community' : 'communities'}
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {membership.community.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {format(new Date(membership.joined_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Link to={`/community/${membership.community.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 px-3 py-1 text-xs"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
