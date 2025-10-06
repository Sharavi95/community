import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TrendingSectionProps {
  title: string;
  icon?: ReactNode;
  loading: boolean;
  error: Error | null;
  emptyMessage: string;
  onRetry?: () => void;
  children: ReactNode;
  isEmpty: boolean;
}

export function TrendingSection({
  title,
  icon,
  loading,
  error,
  emptyMessage,
  onRetry,
  children,
  isEmpty,
}: TrendingSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Could not load data
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message || 'An error occurred while fetching data'}
                </p>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && isEmpty && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !isEmpty && children}
    </section>
  );
}
