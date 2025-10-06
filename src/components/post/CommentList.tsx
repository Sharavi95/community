import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar: string | null;
}

interface CommentListProps {
  postId: string;
  refreshKey?: number;
}

export function CommentList({ postId, refreshKey }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId, refreshKey]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    const query = supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        created_by,
        users_local!comments_created_by_fkey (
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load comments');
      setLoading(false);
      return;
    }

    if (data) {
      const formattedComments: Comment[] = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author_username: comment.users_local?.username || 'Unknown',
        author_avatar: comment.users_local?.avatar_url || null,
      }));
      setComments(formattedComments);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchComments}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.author_avatar || undefined} />
              <AvatarFallback className="text-xs">
                {comment.author_username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {comment.author_username}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
}
