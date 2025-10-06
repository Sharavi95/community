import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

interface ProfileSummaryCardProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {profile.username}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="gap-2 px-4 py-2 text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Bio
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      No bio added yet. Click "Edit Profile" to add one.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Website
                    </p>
                    <p className="text-sm text-gray-700">
                      No website added yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Profile editing feature coming soon. This will allow you to update your bio, website, and avatar.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
