import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
}

interface NewPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
  communityId?: string;
}

export function NewPostModal({ open, onOpenChange, onPostCreated, communityId: initialCommunityId }: NewPostModalProps) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchUserCommunities();
      if (initialCommunityId) {
        setCommunityId(initialCommunityId);
      }
    }
  }, [open, user, initialCommunityId]);

  const fetchUserCommunities = async () => {
    if (!user) return;

    setLoading(true);

    // First get user's community memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('community_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      toast.error('Failed to load your communities');
      setLoading(false);
      return;
    }

    const communityIds = memberships?.map(m => m.community_id) || [];

    if (communityIds.length === 0) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    // Then get the community details
    const query = supabase
      .from('communities')
      .select('id, name')
      .in('id', communityIds);
    
    const [data, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to load your communities');
    } else if (data) {
      setCommunities(data as Community[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    const query = supabase.from('posts').insert({
      title,
      content,
      community_id: communityId,
      created_by: user.id,
    });

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post created successfully!');
      setTitle('');
      setContent('');
      setCommunityId('');
      onPostCreated();
      onOpenChange(false);
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Create New Post
          </DialogTitle>
          <DialogDescription>
            Share your thoughts with your communities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={submitting}
              rows={6}
              className="resize-none"
            />
          </div>

          {!initialCommunityId && (
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Select
                value={communityId}
                onValueChange={setCommunityId}
                disabled={loading || submitting}
                required
              >
                <SelectTrigger id="community">
                  <SelectValue placeholder="Select a community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {communities.length === 0 && !loading && (
                <p className="text-sm text-gray-600">
                  Join a community first to create posts
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || (!initialCommunityId && communities.length === 0)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
