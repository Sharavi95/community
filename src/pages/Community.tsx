import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, AlertCircle, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { MemberList } from '@/components/communities/MemberList';
import { PostList } from '@/components/communities/PostList';
import { NewPostModal } from '@/components/home/NewPostModal';

interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function Community() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCommunity();
      if (user) {
        checkMembership();
      }
    }
  }, [id, user]);

  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('communities_with_counts')
      .select('*')
      .eq('id', id)
      .single();

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load community');
      setLoading(false);
      return;
    }

    if (data) {
      setCommunity({
        id: data.id,
        name: data.name,
        description: data.description,
        created_at: data.created_at,
      });
      setMemberCount(data.member_count || 0);
      
      // Fetch the community's creator to check ownership
      if (user) {
        const ownerQuery = supabase
          .from('communities')
          .select('created_by')
          .eq('id', id)
          .maybeSingle();
        
        const [ownerData] = await safeFetch(ownerQuery);
        setIsOwner(ownerData?.created_by === user.id);
      }
    }

    setLoading(false);
  };

  const checkMembership = async () => {
    if (!user || !id) return;

    const query = supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('community_id', id)
      .maybeSingle();

    const [data] = await safeFetch(query);
    setIsMember(!!data);
  };

  const handleJoinLeave = async () => {
    if (!user) {
      toast.error('Please sign in to join communities');
      return;
    }

    setJoinLoading(true);

    if (isMember) {
      const query = supabase
        .from('memberships')
        .delete()
        .match({ user_id: user.id, community_id: id });

      const [, error] = await safeFetch(query);

      if (error) {
        toast.error('Failed to leave community');
      } else {
        toast.success('Left community');
        setIsMember(false);
        setMemberCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      const query = supabase.from('memberships').insert({
        user_id: user.id,
        community_id: id,
      });

      const [, error] = await safeFetch(query);

      if (error) {
        toast.error('Failed to join community');
      } else {
        toast.success('Joined community!');
        setIsMember(true);
        setMemberCount((prev) => prev + 1);
      }
    }

    setJoinLoading(false);
  };

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="lg:grid lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-8 space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
              <div className="lg:col-span-4 mt-6 lg:mt-0">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-600">
                    {error || 'Community not found'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchCommunity}
                    className="ml-auto"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Community Header */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {community.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{memberCount} members</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user && (isOwner || isMember) && (
                    <Link to={`/community/${id}/settings`}>
                      <Button
                        variant="secondary"
                        className="gap-2 px-4 py-2 text-sm font-medium"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                  )}
                  {!user ? (
                    <Button
                      variant="secondary"
                      disabled
                      className="gap-2 px-4 py-2 text-sm font-medium"
                    >
                      <UserPlus className="h-4 w-4" />
                      Login to Join
                    </Button>
                  ) : isMember ? (
                    <Button
                      variant="secondary"
                      onClick={handleJoinLeave}
                      disabled={joinLoading}
                      className="gap-2 px-4 py-2 text-sm font-medium"
                    >
                      <UserMinus className="h-4 w-4" />
                      Leave
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinLeave}
                      disabled={joinLoading}
                      className="gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserPlus className="h-4 w-4" />
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            {/* Posts Feed */}
            <div className="lg:col-span-8 space-y-6">
              <PostList communityId={id!} refreshKey={refreshKey} />
            </div>

            {/* Member List */}
            <div className="lg:col-span-4 mt-6 lg:mt-0">
              <MemberList communityId={id!} />
            </div>
          </div>

          {/* Floating New Post Button */}
          {user && isMember && (
            <>
              <Button
                onClick={() => setShowNewPostModal(true)}
                className="fixed bottom-5 right-5 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
              >
                <Plus className="h-6 w-6" />
              </Button>

              <NewPostModal
                open={showNewPostModal}
                onOpenChange={setShowNewPostModal}
                onPostCreated={handlePostCreated}
                communityId={id}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
