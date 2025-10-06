import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportDetail {
  id: string;
  report_type: 'post' | 'comment';
  status: 'pending' | 'resolved' | 'dismissed';
  reason: string | null;
  created_at: string;
  reporter_username: string;
  community_id: string;
  community_name: string;
  content_title?: string;
  content_text: string;
  content_author: string;
  content_id: string;
}

interface ReportDetailDrawerProps {
  reportId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReportDetailDrawer({
  reportId,
  onClose,
  onUpdate,
}: ReportDetailDrawerProps) {
  const { user } = useAuth();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    setLoading(true);

    const query = supabase
      .from('reports')
      .select(`
        id,
        report_type,
        status,
        reason,
        created_at,
        community_id,
        post_id,
        comment_id,
        users_local!reports_reported_by_fkey (
          username
        ),
        communities!reports_community_id_fkey (
          name
        ),
        posts!reports_post_id_fkey (
          id,
          title,
          content,
          users_local!posts_created_by_fkey (
            username
          )
        ),
        comments!reports_comment_id_fkey (
          id,
          content,
          users_local!comments_created_by_fkey (
            username
          )
        )
      `)
      .eq('id', reportId)
      .maybeSingle();

    const [data] = await safeFetch(query);

    if (data) {
      const isPost = data.report_type === 'post';
      const content = isPost ? data.posts : data.comments;

      setReport({
        id: data.id,
        report_type: data.report_type,
        status: data.status,
        reason: data.reason,
        created_at: data.created_at,
        reporter_username: data.users_local?.username || 'Unknown',
        community_id: data.community_id,
        community_name: data.communities?.name || 'Unknown',
        content_title: isPost ? content?.title : undefined,
        content_text: content?.content || '',
        content_author: content?.users_local?.username || 'Unknown',
        content_id: isPost ? data.post_id : data.comment_id,
      });
    }

    setLoading(false);
  };

  const handleMarkAsReviewed = async () => {
    if (!report || !user) return;

    setProcessing(true);

    const updateQuery = supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', report.id);

    const [, error] = await safeFetch(updateQuery);

    if (error) {
      toast.error('Failed to update report');
    } else {
      // Log the action
      await supabase.from('moderation_actions').insert({
        moderator_id: user.id,
        action_type: 'resolved',
        target_type: report.report_type,
        target_id: report.content_id,
        community_id: report.community_id,
        description: `Marked ${report.report_type} report as resolved`,
      });

      toast.success('Report marked as resolved');
      onUpdate();
    }

    setProcessing(false);
  };

  const handleDismiss = async () => {
    if (!report || !user) return;

    setProcessing(true);

    const updateQuery = supabase
      .from('reports')
      .update({
        status: 'dismissed',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', report.id);

    const [, error] = await safeFetch(updateQuery);

    if (error) {
      toast.error('Failed to dismiss report');
    } else {
      // Log the action
      await supabase.from('moderation_actions').insert({
        moderator_id: user.id,
        action_type: 'dismissed',
        target_type: report.report_type,
        target_id: report.content_id,
        community_id: report.community_id,
        description: `Dismissed ${report.report_type} report`,
      });

      toast.success('Report dismissed');
      onUpdate();
    }

    setProcessing(false);
  };

  const handleDeleteContent = async () => {
    if (!report || !user) return;

    setProcessing(true);
    setShowDeleteDialog(false);

    // Update content status to deleted
    const tableName = report.report_type === 'post' ? 'posts' : 'comments';
    const updateQuery = supabase
      .from(tableName)
      .update({ status: 'deleted' })
      .eq('id', report.content_id);

    const [, updateError] = await safeFetch(updateQuery);

    if (updateError) {
      toast.error('Failed to delete content');
      setProcessing(false);
      return;
    }

    // Mark report as resolved
    await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', report.id);

    // Log the action
    await supabase.from('moderation_actions').insert({
      moderator_id: user.id,
      action_type: 'delete_content',
      target_type: report.report_type,
      target_id: report.content_id,
      community_id: report.community_id,
      description: `Deleted ${report.report_type} by ${report.content_author}`,
    });

    toast.success('Content deleted successfully');
    onUpdate();
    setProcessing(false);
  };

  if (loading) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
          <SheetHeader>
            <Skeleton className="h-6 w-32" />
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-2xl">Report Details</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Report Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="capitalize">{report.report_type}</Badge>
                <Badge
                  className={
                    report.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : report.status === 'resolved'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                >
                  {report.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Reported by:</span>{' '}
                  <span className="font-medium">{report.reporter_username}</span>
                </p>
                <p>
                  <span className="text-gray-500">Community:</span>{' '}
                  <span className="font-medium">{report.community_name}</span>
                </p>
                <p>
                  <span className="text-gray-500">Date:</span>{' '}
                  {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                {report.reason && (
                  <p>
                    <span className="text-gray-500">Reason:</span>{' '}
                    {report.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Reported Content
              </h3>
              {report.content_title && (
                <p className="text-base font-semibold text-gray-900 mb-2">
                  {report.content_title}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                {report.content_text}
              </p>
              <p className="text-xs text-gray-500">
                Author: {report.content_author}
              </p>
            </div>

            {/* Actions */}
            {report.status === 'pending' && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleMarkAsReviewed}
                  disabled={processing}
                  className="w-full px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={processing}
                  variant="secondary"
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Content
                </Button>
                <Button
                  onClick={handleDismiss}
                  disabled={processing}
                  variant="secondary"
                  className="w-full px-4 py-2 text-sm font-medium"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss Report
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {report.report_type}? This action
              cannot be undone and will permanently remove the content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? 'Deleting...' : 'Delete Content'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
