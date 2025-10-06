import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { TrendingSection } from './TrendingSection';
import { NewPostModal } from './NewPostModal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Globe, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  community_name: string;
  author: string;
}

export function DashboardFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [globalPosts, setGlobalPosts] = useState<Post[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [myError, setMyError] = useState<Error | null>(null);
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);

  useEffect(() => {
    fetchMyPosts();
    fetchGlobalPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    if (!user) return;

    setMyLoading(true);
    setMyError(null);

    // First get user's communities
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('community_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      setMyError(new Error('Failed to load your community posts'));
      setMyLoading(false);
      return;
    }

    const communityIds = memberships?.map(m => m.community_id) || [];

    if (communityIds.length === 0) {
      setMyPosts([]);
      setMyLoading(false);
      return;
    }

    // Then get posts from those communities
    const query = supabase
      .from('posts_with_meta')
      .select('*')
      .in('community_id', communityIds)
      .order('created_at', { ascending: false });
    
    const [data, error] = await safeFetch(query);

    if (error) {
      setMyError(new Error('Failed to load your community posts'));
    } else if (data) {
      setMyPosts(data as Post[]);
    }

    setMyLoading(false);
  };

  const fetchGlobalPosts = async () => {
    setGlobalLoading(true);
    setGlobalError(null);

    const query = supabase
      .from('posts_with_meta')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const [data, error] = await safeFetch(query);

    if (error) {
      setGlobalError(new Error('Failed to load global posts'));
    } else if (data) {
      setGlobalPosts(data as Post[]);
    }

    setGlobalLoading(false);
  };

  const handlePostCreated = () => {
    fetchMyPosts();
    fetchGlobalPosts();
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card
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
                {post.author || 'Unknown'}
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
          {post.content?.substring(0, 150) || 'No content'}
          {post.content?.length > 150 ? '...' : ''}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome back, {user?.username || 'Member'}! 👋
          </h2>
          <Button
            onClick={() => setNewPostModalOpen(true)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        <Tabs defaultValue="my-communities" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-communities" className="gap-2">
              <Users className="h-4 w-4" />
              My Communities
            </TabsTrigger>
            <TabsTrigger value="global" className="gap-2">
              <Globe className="h-4 w-4" />
              Global Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-communities" className="space-y-4">
            <TrendingSection
              title=""
              loading={myLoading}
              error={myError}
              emptyMessage="No posts in your communities yet. Join more communities or create your first post!"
              onRetry={fetchMyPosts}
              isEmpty={myPosts.length === 0}
            >
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TrendingSection>
          </TabsContent>

          <TabsContent value="global" className="space-y-4">
            <TrendingSection
              title=""
              loading={globalLoading}
              error={globalError}
              emptyMessage="No posts yet — be the first to create one!"
              onRetry={fetchGlobalPosts}
              isEmpty={globalPosts.length === 0}
            >
              <div className="space-y-4">
                {globalPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TrendingSection>
          </TabsContent>
        </Tabs>
      </div>

      <NewPostModal
        open={newPostModalOpen}
        onOpenChange={setNewPostModalOpen}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
