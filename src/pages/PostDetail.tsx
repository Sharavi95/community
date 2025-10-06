import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Header } from '@/components/layout/Header';
import { PostHeader } from '@/components/post/PostHeader';
import { CommentList } from '@/components/post/CommentList';
import { AddCommentForm } from '@/components/post/AddCommentForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar: string | null;
  community_id: string;
  community_name: string;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        created_by,
        community_id,
        users_local!posts_created_by_fkey (
          username,
          avatar_url
        ),
        communities!posts_community_id_fkey (
          id,
          name
        )
      `)
      .eq('id', id)
      .maybeSingle();

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load post');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Post not found');
      setLoading(false);
      return;
    }

    setPost({
      id: data.id,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
      author_username: data.users_local?.username || 'Unknown',
      author_avatar: data.users_local?.avatar_url || null,
      community_id: data.communities?.id || '',
      community_name: data.communities?.name || 'Unknown',
    });

    setLoading(false);
  };

  const handleCommentAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-6 space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
              <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error || 'Post not found'}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchPost}
                  className="ml-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <PostHeader post={post} />
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Comments</h2>
            </div>
            <div className="p-6">
              <CommentList postId={id!} refreshKey={refreshKey} />
            </div>
          </div>

          <AddCommentForm postId={id!} onCommentAdded={handleCommentAdded} />
        </div>
      </main>
    </div>
  );
}
