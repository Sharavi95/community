import { useState } from 'react';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunityCreated: () => void;
}

export function CreateCommunityModal({
  open,
  onOpenChange,
  onCommunityCreated,
}: CreateCommunityModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    const query = supabase.from('communities').insert({
      name,
      description,
      created_by: user.id,
    });

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to create community');
    } else {
      toast.success('Community created successfully!');
      setName('');
      setDescription('');
      onCommunityCreated();
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
            Create New Community
          </DialogTitle>
          <DialogDescription>
            Start a new community and bring people together around shared interests
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="Enter community name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your community's purpose and values..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={6}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
