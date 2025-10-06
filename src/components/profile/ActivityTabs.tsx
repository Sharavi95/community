import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  community_name: string;
  community_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_title: string;
  post_id: string;
}

interface ActivityTabsProps {
  userId: string;
}

export function ActivityTabs({ userId }: ActivityTabsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchComments();
  }, [userId]);

  const fetchPosts = async () => {
    setPostsLoading(true);
    setPostsError(null);

    const query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        communities!posts_community_id_fkey (
          id,
          name
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const [data, err] = await safeFetch(query);

    if (err) {
      setPostsError('Failed to load posts');
      setPostsLoading(false);
      return;
    }

    if (data) {
      const formattedPosts = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        created_at: item.created_at,
        community_name: item.communities?.name || 'Unknown',
        community_id: item.communities?.id || '',
      }));
      setPosts(formattedPosts);
    }

    setPostsLoading(false);
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);

    const query = supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        posts!comments_post_id_fkey (
          id,
          title
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const [data, err] = await safeFetch(query);

    if (err) {
      setCommentsError('Failed to load comments');
      setCommentsLoading(false);
      return;
    }

    if (data) {
      const formattedComments = data.map((item: any) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        post_title: item.posts?.title || 'Unknown Post',
        post_id: item.posts?.id || '',
      }));
      setComments(formattedComments);
    }

    setCommentsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <Tabs defaultValue="posts" className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="posts" className="p-6 m-0">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : postsError ? (
            <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{postsError}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchPosts}>
                Retry
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all hover-scale"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(post.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      {post.community_name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="p-6 m-0">
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : commentsError ? (
            <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{commentsError}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchComments}>
                Retry
              </Button>
            </div>
          ) : comments.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  to={`/post/${comment.post_id}`}
                  className="block border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all hover-scale"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs text-gray-500">
                      Comment on: <span className="font-medium text-gray-700">{comment.post_title}</span>
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(comment.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {comment.content}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
