import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Mail } from 'lucide-react';

interface InviteMembersCardProps {
  communityId: string;
}

export function InviteMembersCard({ communityId }: InviteMembersCardProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);

    // Simulate sending invitation
    setTimeout(() => {
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setSending(false);
    }, 1000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Invite Members</h2>
        <p className="text-sm text-gray-600 mt-1">
          Send invitations to join this community
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  disabled={sending}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendInvite();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSendInvite}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">
              Feature coming soon: Invitations will be sent via email with a unique join link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
