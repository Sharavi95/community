import { Users, FileText, MessageSquare, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalMembers: number;
  activePosts: number;
  commentsPosted: number;
  engagementRate: number;
}

interface AnalyticsKpiCardsProps {
  data: AnalyticsData | null;
}

export function AnalyticsKpiCards({ data }: AnalyticsKpiCardsProps) {
  const kpiItems = [
    {
      label: 'Total Members',
      value: data?.totalMembers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Posts',
      value: data?.activePosts ?? 0,
      subtitle: 'Last 30 days',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Comments Posted',
      value: data?.commentsPosted ?? 0,
      subtitle: 'Last 30 days',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Engagement Rate',
      value: data?.engagementRate ?? 0,
      subtitle: 'Comments per post',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      isDecimal: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4 animate-fade-in">
      {kpiItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${item.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900">
              {item.isDecimal ? item.value.toFixed(2) : item.value}
            </p>
            {item.subtitle && (
              <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
