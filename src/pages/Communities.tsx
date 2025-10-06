import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/communities/SearchBar';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { CreateCommunityModal } from '@/components/communities/CreateCommunityModal';
import { TrendingSection } from '@/components/home/TrendingSection';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Users } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
}

export default function Communities() {
  const { user, loading: authLoading } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userMemberships, setUserMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchUserMemberships();
    }
  }, [user]);

  const fetchCommunities = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('communities_with_counts')
      .select('*')
      .order('member_count', { ascending: false });

    const [data, error] = await safeFetch<Community[]>(query);

    if (error) {
      setError(new Error('Failed to load communities'));
    } else if (data) {
      setCommunities(data);
    }

    setLoading(false);
  };

  const fetchUserMemberships = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('memberships')
      .select('community_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setUserMemberships(new Set(data.map((m) => m.community_id)));
    }
  };

  const handleJoinLeave = () => {
    fetchCommunities();
    if (user) {
      fetchUserMemberships();
    }
  };

  const handleCommunityCreated = () => {
    fetchCommunities();
    if (user) {
      fetchUserMemberships();
    }
  };

  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return communities;

    const query = searchQuery.toLowerCase();
    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query)
    );
  }, [communities, searchQuery]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-subtle)]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const showEmptyState = !loading && !error && filteredCommunities.length === 0;
  const isSearchEmpty = searchQuery.trim() && filteredCommunities.length === 0;

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Communities Directory
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and join communities that match your interests
            </p>
          </div>
          {user && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search communities by name or description..."
          />
        </div>

        {/* Communities Grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-[var(--shadow-soft)]">
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2 mt-4" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <TrendingSection
            title=""
            loading={false}
            error={error}
            emptyMessage=""
            onRetry={fetchCommunities}
            isEmpty={false}
          >
            <></>
          </TrendingSection>
        )}

        {isSearchEmpty && (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No communities match your search for "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}

        {showEmptyState && !isSearchEmpty && (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No communities yet</p>
                <p className="text-muted-foreground mt-1">
                  {user
                    ? "Be the first to create a community!"
                    : "Start one and bring people together!"}
                </p>
              </div>
              {user && (
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Community
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredCommunities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={userMemberships.has(community.id)}
                onJoinLeave={handleJoinLeave}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredCommunities.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredCommunities.length} of {communities.length} communities
          </p>
        )}
      </main>

      {/* Floating Create Button (mobile) */}
      {user && (
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="fixed bottom-5 right-5 sm:hidden rounded-full h-14 w-14 shadow-[var(--shadow-elegant)] bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      )}

      <CreateCommunityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
}
