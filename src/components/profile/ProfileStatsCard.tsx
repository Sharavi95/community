import { MessageSquareText, Users, FileText } from 'lucide-react';

interface ProfileStats {
  posts_count: number;
  comments_count: number;
  communities_count: number;
}

interface ProfileStatsCardProps {
  stats: ProfileStats | null;
}

export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const statItems = [
    {
      label: 'Posts',
      value: stats?.posts_count ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Comments',
      value: stats?.comments_count ?? 0,
      icon: MessageSquareText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Communities',
      value: stats?.communities_count ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Activity Stats</h2>
        <p className="text-sm text-gray-600 mt-1">Your platform engagement</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${item.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
