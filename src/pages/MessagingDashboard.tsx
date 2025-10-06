import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Header } from '@/components/layout/Header';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { NewConversationModal } from '@/components/messaging/NewConversationModal';
import { GroupChatModal } from '@/components/messaging/GroupChatModal';
import { Button } from '@/components/ui/button';
import { Plus, WifiOff, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function MessagingDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupChatOpen, setIsNewGroupChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'No connection',
        description: 'You are currently offline.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleConversationCreated = (conversationId: string) => {
    setIsNewChatOpen(false);
    setSelectedConversationId(conversationId);
    // Trigger refresh of conversation list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGroupCreated = (conversationId: string) => {
    setIsNewGroupChatOpen(false);
    setSelectedConversationId(conversationId);
    // Trigger refresh of conversation list
    setRefreshTrigger(prev => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages & Connections</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with community members
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsNewChatOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button onClick={() => setIsNewGroupChatOpen(true)} className="gap-2" variant="outline">
              <Users className="h-4 w-4" />
              New Group Chat
            </Button>
          </div>
        </div>

        {!isOnline && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-2 text-destructive">
            <WifiOff className="h-5 w-5" />
            <p className="text-sm font-medium">You are currently offline. Messages will be sent when connection is restored.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 h-[calc(100vh-240px)] border border-border rounded-lg overflow-hidden bg-card">
          <div className="border-r border-border lg:block hidden">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              refreshTrigger={refreshTrigger}
            />
          </div>
          
          {/* Mobile: Show conversation list when no conversation selected */}
          <div className="lg:hidden block">
            {!selectedConversationId ? (
              <ConversationList
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <ChatWindow 
                conversationId={selectedConversationId} 
                isOnline={isOnline}
                onBack={() => setSelectedConversationId(null)}
              />
            )}
          </div>
          
          {/* Desktop: Show chat window */}
          <div className="flex-1 flex-col bg-background hidden lg:flex">
            {selectedConversationId ? (
              <ChatWindow 
                conversationId={selectedConversationId} 
                isOnline={isOnline}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No conversation selected
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Select a conversation from the list or start a new one to begin messaging
                </p>
                <Button onClick={() => setIsNewChatOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationModal
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onConversationCreated={handleConversationCreated}
      />

      <GroupChatModal
        open={isNewGroupChatOpen}
        onOpenChange={setIsNewGroupChatOpen}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
