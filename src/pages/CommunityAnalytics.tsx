import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Header } from '@/components/layout/Header';
import { AnalyticsKpiCards } from '@/components/analytics/AnalyticsKpiCards';
import { CommunityGrowthChart } from '@/components/analytics/CommunityGrowthChart';
import { ActivityBreakdownChart } from '@/components/analytics/ActivityBreakdownChart';
import { TopContributorsCard } from '@/components/analytics/TopContributorsCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertCircle, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
}

interface AnalyticsData {
  totalMembers: number;
  activePosts: number;
  commentsPosted: number;
  engagementRate: number;
}

export default function CommunityAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchOwnerCommunities();
  }, [user, navigate]);

  useEffect(() => {
    if (communities.length > 0) {
      fetchAnalytics();
    }
  }, [selectedCommunity, communities, refreshKey]);

  const fetchOwnerCommunities = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch communities where user is owner
      const ownedQuery = supabase
        .from('communities')
        .select('id, name')
        .eq('created_by', user.id);

      // Fetch communities where user is admin
      const roleQuery = supabase
        .from('community_roles')
        .select(`
          communities!community_roles_community_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('role', 'admin');

      const [ownedData, roleData] = await Promise.all([
        safeFetch(ownedQuery),
        safeFetch(roleQuery),
      ]);

      const allCommunities: Community[] = [];

      if (ownedData[0]) {
        allCommunities.push(...(ownedData[0] as Community[]));
      }

      if (roleData[0]) {
        roleData[0].forEach((item: any) => {
          if (item.communities && !allCommunities.some(c => c.id === item.communities.id)) {
            allCommunities.push(item.communities);
          }
        });
      }

      if (allCommunities.length === 0) {
        setError('You do not own or admin any communities');
        setLoading(false);
        return;
      }

      setCommunities(allCommunities);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics dashboard');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (communities.length === 0) return;

    const communityIds =
      selectedCommunity === 'all'
        ? communities.map((c) => c.id)
        : [selectedCommunity];

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch total members
      const membersQuery = supabase
        .from('memberships')
        .select('id', { count: 'exact', head: true })
        .in('community_id', communityIds);

      // Fetch active posts (last 30 days)
      const postsQuery = supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .in('community_id', communityIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'active');

      // Fetch comments (last 30 days)
      const commentsQuery = supabase
        .from('comments')
        .select('id, post_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'active');

      const [membersData, postsData, commentsData] = await Promise.all([
        safeFetch(membersQuery),
        safeFetch(postsQuery),
        safeFetch(commentsQuery),
      ]);

      const totalMembers = membersData[0]?.length ?? 0;
      const activePosts = postsData[0]?.length ?? 0;
      
      // Filter comments that belong to posts in our communities
      let commentsCount = 0;
      if (commentsData[0]) {
        const postIds = new Set();
        const postsInCommunitiesQuery = supabase
          .from('posts')
          .select('id')
          .in('community_id', communityIds);
        
        const [postsInCommunities] = await safeFetch(postsInCommunitiesQuery);
        if (postsInCommunities) {
          postsInCommunities.forEach((p: any) => postIds.add(p.id));
          commentsCount = commentsData[0].filter((c: any) => 
            postIds.has(c.post_id)
          ).length;
        }
      }

      const engagementRate = activePosts > 0 
        ? Math.round((commentsCount / activePosts) * 100) / 100
        : 0;

      setAnalyticsData({
        totalMembers,
        activePosts,
        commentsPosted: commentsCount,
        engagementRate,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleExportData = () => {
    if (!analyticsData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Members', analyticsData.totalMembers],
      ['Active Posts (30 days)', analyticsData.activePosts],
      ['Comments Posted (30 days)', analyticsData.commentsPosted],
      ['Engagement Rate', analyticsData.engagementRate],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Analytics data exported');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
              <div className="border border-red-200 bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchOwnerCommunities}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                  Community Analytics & Insights
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Track growth and engagement across your communities
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue placeholder="Filter by community" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All Communities</SelectItem>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleExportData}
                variant="secondary"
                className="gap-2 px-4 py-2 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <AnalyticsKpiCards data={analyticsData} />

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Growth Chart */}
            <div className="lg:col-span-2">
              <CommunityGrowthChart
                communityIds={
                  selectedCommunity === 'all'
                    ? communities.map((c) => c.id)
                    : [selectedCommunity]
                }
                refreshKey={refreshKey}
              />
            </div>

            {/* Top Contributors */}
            <div>
              <TopContributorsCard
                communityIds={
                  selectedCommunity === 'all'
                    ? communities.map((c) => c.id)
                    : [selectedCommunity]
                }
                refreshKey={refreshKey}
              />
            </div>
          </div>

          {/* Activity Breakdown */}
          <ActivityBreakdownChart
            communities={
              selectedCommunity === 'all'
                ? communities
                : communities.filter((c) => c.id === selectedCommunity)
            }
            refreshKey={refreshKey}
          />
        </div>
      </main>
    </div>
  );
}
