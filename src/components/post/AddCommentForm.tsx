import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AddCommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export function AddCommentForm({ postId, onCommentAdded }: AddCommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);

    const query = supabase.from('comments').insert({
      post_id: postId,
      content: content.trim(),
      created_by: user.id,
    });

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to add comment');
    } else {
      toast.success('Comment added!');
      setContent('');
      onCommentAdded();
      
      // Scroll to bottom after a short delay to allow new comment to render
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }

    setSubmitting(false);
  };

  if (!user) {
    return (
      <>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
          <div className="text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Sign in to join the discussion
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>

        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent>
            <LoginForm />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-900 mb-2">
            Add a comment
          </label>
          <Textarea
            id="comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full min-h-[96px] rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            disabled={submitting}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
