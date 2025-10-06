import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Header } from '@/components/layout/Header';
import { DashboardFeed } from '@/components/home/DashboardFeed';
import { TrendingSection } from '@/components/home/TrendingSection';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles, Users, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/LoginForm';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  community_name: string;
  author_username: string;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [communitiesError, setCommunitiesError] = useState<Error | null>(null);
  const [postsError, setPostsError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      fetchTrendingCommunities();
      fetchTrendingPosts();
    }
  }, [user]);

  const fetchTrendingCommunities = async () => {
    setCommunitiesLoading(true);
    setCommunitiesError(null);

    const query = supabase
      .from('communities_with_counts')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(3);

    const [data, error] = await safeFetch(query);

    if (error) {
      setCommunitiesError(new Error('Failed to load trending communities'));
    } else if (data) {
      setCommunities(data as Community[]);
    }

    setCommunitiesLoading(false);
  };

  const fetchTrendingPosts = async () => {
    setPostsLoading(true);
    setPostsError(null);

    const query = supabase
      .from('posts_with_meta')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const [data, error] = await safeFetch(query);

    if (error) {
      setPostsError(new Error('Failed to load trending posts'));
    } else if (data) {
      setPosts(data as Post[]);
    }

    setPostsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-subtle)]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {user ? (
          <DashboardFeed />
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Discover. Connect. Belong.
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Join our vibrant community platform where you can explore ideas, connect with
                  others, and find your place to belong.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setLoginModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-elegant)] text-lg px-8 py-6"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Join the Community
              </Button>
            </section>

            {/* Trending Communities */}
            <TrendingSection
              title="Trending Communities"
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              loading={communitiesLoading}
              error={communitiesError}
              emptyMessage="No trending communities yet — be the first to start one."
              onRetry={fetchTrendingCommunities}
              isEmpty={communities.length === 0}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communities.map((community) => (
                  <Card
                    key={community.id}
                    className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer"
                    onClick={() => navigate(`/community/${community.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {community.name}
                        <Badge variant="secondary" className="ml-auto">
                          <Users className="h-3 w-3 mr-1" />
                          {community.member_count || 0}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {community.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TrendingSection>

            {/* Trending Posts */}
            <TrendingSection
              title="Trending Posts"
              icon={<Sparkles className="h-6 w-6 text-accent" />}
              loading={postsLoading}
              error={postsError}
              emptyMessage="No posts yet — join and create your first post."
              onRetry={fetchTrendingPosts}
              isEmpty={posts.length === 0}
            >
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {post.community_name || 'Community'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author_username || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content?.substring(0, 100) || 'No content'}
                        {post.content?.length > 100 ? '...' : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TrendingSection>
          </div>
        )}
      </main>

      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Sign In</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setLoginModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
