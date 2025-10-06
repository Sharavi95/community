import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Report {
  id: string;
  report_type: 'post' | 'comment';
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter_username: string;
  community_name: string;
}

interface ReportsTableProps {
  communityIds: string[];
  refreshKey?: number;
  onSelectReport: (reportId: string) => void;
}

export function ReportsTable({
  communityIds,
  refreshKey,
  onSelectReport,
}: ReportsTableProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [communityIds, refreshKey]);

  const fetchReports = async () => {
    if (communityIds.length === 0) return;

    setLoading(true);
    setError(null);

    const query = supabase
      .from('reports')
      .select(`
        id,
        report_type,
        status,
        created_at,
        users_local!reports_reported_by_fkey (
          username
        ),
        communities!reports_community_id_fkey (
          name
        )
      `)
      .in('community_id', communityIds)
      .order('created_at', { ascending: false })
      .limit(50);

    const [data, err] = await safeFetch(query);

    if (err) {
      setError('Failed to load reports');
      setLoading(false);
      return;
    }

    if (data) {
      const formattedReports: Report[] = data.map((item: any) => ({
        id: item.id,
        report_type: item.report_type,
        status: item.status,
        created_at: item.created_at,
        reporter_username: item.users_local?.username || 'Unknown',
        community_name: item.communities?.name || 'Unknown',
      }));
      setReports(formattedReports);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            Resolved
          </Badge>
        );
      case 'dismissed':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
            Dismissed
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: Report['report_type']) => {
    return type === 'post' ? (
      <FileText className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
        <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchReports}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No reports found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-600 mt-1">{reports.length} reports</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Community</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelectReport(report.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.report_type)}
                    <span className="capitalize text-sm">{report.report_type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{report.reporter_username}</TableCell>
                <TableCell className="text-sm">{report.community_name}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(report.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs px-3 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(report.id);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
