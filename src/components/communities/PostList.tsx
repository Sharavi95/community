import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  author: string | null;
}

interface PostListProps {
  communityId: string;
  refreshKey?: number;
}

export function PostList({ communityId, refreshKey = 0 }: PostListProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [communityId, refreshKey]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        users_local (
          username
        )
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load posts');
      setLoading(false);
      return;
    }

    if (data) {
      const postList = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        author: p.users_local?.username || 'Unknown',
      }));
      setPosts(postList);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-[var(--shadow-soft)] border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-[var(--shadow-soft)] border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchPosts}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="shadow-[var(--shadow-soft)] border-border/50">
        <CardContent className="pt-6">
          <div className="border-dashed border-2 border-border rounded-xl p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No posts yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start the conversation by creating the first post!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elegant)] transition-shadow"
        >
          <CardHeader>
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <CardDescription>
              by {post.author} •{' '}
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content || 'No content'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/post/${post.id}`)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Post
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
