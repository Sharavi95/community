import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface ModerationStats {
  total_reports: number;
  active_reports: number;
  resolved_reports: number;
  actions_taken: number;
}

interface ModerationSummaryCardProps {
  stats: ModerationStats | null;
}

export function ModerationSummaryCard({ stats }: ModerationSummaryCardProps) {
  const summaryItems = [
    {
      label: 'Total Reports',
      value: stats?.total_reports ?? 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Reports',
      value: stats?.active_reports ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Resolved Reports',
      value: stats?.resolved_reports ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Actions Taken',
      value: stats?.actions_taken ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4 animate-fade-in">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`${item.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
