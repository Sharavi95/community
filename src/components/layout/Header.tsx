import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/auth/LoginForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, LogIn, Shield, BarChart3, Bell, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/utils/safeFetch';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    const query = supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    const [data] = await safeFetch(query);
    setUnreadCount(data?.length ?? 0);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-semibold text-lg">AuthApp</span>
          </Link>
        </div>
      </header>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-soft)]" />
            <span className="font-semibold text-lg">AuthApp</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                className={isActive('/') ? 'bg-secondary' : ''}
              >
                Home
              </Button>
            </Link>
            <Link to="/communities">
              <Button
                variant="ghost"
                className={isActive('/communities') ? 'bg-secondary' : ''}
              >
                Communities
              </Button>
            </Link>
            {user && (
              <Link to="/messages">
                <Button
                  variant="ghost"
                  className={isActive('/messages') ? 'bg-secondary' : ''}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
            )}
            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <>
                <Link to="/moderation">
                  <Button
                    variant="ghost"
                    className={isActive('/moderation') ? 'bg-secondary' : ''}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Moderation
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button
                    variant="ghost"
                    className={isActive('/analytics') ? 'bg-secondary' : ''}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        <nav className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(true)}
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Signed in as{' '}
                <span className="font-medium text-foreground">
                  {user.username || user.email}
                </span>
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full transition-all hover:shadow-[var(--shadow-soft)]"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username || user.email} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {user.role && (
                        <p className="text-xs leading-none text-muted-foreground">
                          Role: <span className="capitalize">{user.role}</span>
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="sr-only">Sign In</DialogTitle>
                </DialogHeader>
                <LoginForm onSuccess={() => setLoginDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </nav>
      </div>
      
      <NotificationsDrawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </header>
  );
}
