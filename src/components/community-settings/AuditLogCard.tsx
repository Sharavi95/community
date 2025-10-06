import { FileText, UserPlus, UserMinus, Edit, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: 'edit' | 'member_add' | 'member_remove' | 'role_change';
}

interface AuditLogCardProps {
  communityId: string;
}

export function AuditLogCard({ communityId }: AuditLogCardProps) {
  // Mock audit log data - in production, this would fetch from a database table
  const mockAuditLog: AuditLogEntry[] = [
    {
      id: '1',
      action: 'Updated community description',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'edit',
    },
    {
      id: '2',
      action: 'Added John Doe as a member',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'member_add',
    },
    {
      id: '3',
      action: 'Removed Jane Smith from community',
      user: 'Owner',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'member_remove',
    },
  ];

  const getActionIcon = (type: AuditLogEntry['type']) => {
    switch (type) {
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'member_add':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'member_remove':
        return <UserMinus className="h-4 w-4 text-red-600" />;
      case 'role_change':
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
        <p className="text-sm text-gray-600 mt-1">Recent community actions</p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {mockAuditLog.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getActionIcon(entry.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">by {entry.user}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">
                      {format(entry.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Full audit log feature coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
