import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from 'date-fns';

interface GrowthDataPoint {
  date: string;
  members: number;
}

interface CommunityGrowthChartProps {
  communityIds: string[];
  refreshKey?: number;
}

export function CommunityGrowthChart({
  communityIds,
  refreshKey,
}: CommunityGrowthChartProps) {
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchGrowthData();
  }, [communityIds, refreshKey, viewMode]);

  const fetchGrowthData = async () => {
    if (communityIds.length === 0) return;

    setLoading(true);

    const daysBack = viewMode === 'weekly' ? 30 : 90;
    const startDate = subDays(new Date(), daysBack);

    const query = supabase
      .from('memberships')
      .select('joined_at')
      .in('community_id', communityIds)
      .gte('joined_at', startDate.toISOString())
      .order('joined_at', { ascending: true });

    const [memberships] = await safeFetch(query);

    if (memberships) {
      // Group by date
      const dates = viewMode === 'weekly'
        ? eachWeekOfInterval({ start: startDate, end: new Date() }).map(d => startOfWeek(d))
        : eachDayOfInterval({ start: startDate, end: new Date() });

      const growthData: GrowthDataPoint[] = dates.map((date) => {
        const count = memberships.filter((m: any) => {
          const joinedDate = new Date(m.joined_at);
          if (viewMode === 'weekly') {
            const weekStart = startOfWeek(joinedDate);
            return weekStart.getTime() === date.getTime();
          }
          return joinedDate.toDateString() === date.toDateString();
        }).length;

        return {
          date: format(date, viewMode === 'weekly' ? 'MMM d' : 'MMM d'),
          members: count,
        };
      });

      // Calculate cumulative
      let cumulative = 0;
      const cumulativeData = growthData.map(d => {
        cumulative += d.members;
        return { ...d, members: cumulative };
      });

      setData(cumulativeData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Community Growth</h2>
            <p className="text-sm text-gray-600 mt-1">Member growth over time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('weekly')}
              className="text-xs px-3 py-1"
            >
              Weekly
            </Button>
            <Button
              variant={viewMode === 'monthly' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('monthly')}
              className="text-xs px-3 py-1"
            >
              Monthly
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="members"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
