import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';

export default function Post() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">Post Page</h1>
            <p className="text-muted-foreground">
              Post ID: {id}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This page is a placeholder. Full post details will be implemented next.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
