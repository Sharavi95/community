import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface GeneralSettingsCardProps {
  community: Community;
  onUpdate: () => void;
}

export function GeneralSettingsCard({ community, onUpdate }: GeneralSettingsCardProps) {
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    const changed =
      name !== community.name || description !== (community.description || '');
    setHasChanges(changed);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }

    setSubmitting(true);

    const query = supabase
      .from('communities')
      .update({
        name: name.trim(),
        description: description.trim() || null,
      })
      .eq('id', community.id);

    const [, error] = await safeFetch(query);

    if (error) {
      toast.error('Failed to update community settings');
    } else {
      toast.success('Community settings updated successfully');
      setHasChanges(false);
      onUpdate();
    }

    setSubmitting(false);
  };

  const handleCancel = () => {
    setName(community.name);
    setDescription(community.description || '');
    setHasChanges(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your community's basic information
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                handleChange();
              }}
              placeholder="Enter community name"
              disabled={submitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleChange();
              }}
              placeholder="Describe your community..."
              disabled={submitting}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {hasChanges && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 animate-fade-in">
              <Button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={submitting}
                variant="secondary"
                className="flex-1 px-4 py-2 text-sm font-medium"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
