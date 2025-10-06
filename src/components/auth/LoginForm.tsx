import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function LoginForm({ onSuccess, compact = false }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await signIn(email, password);
    
    if (success) {
      setEmail('');
      setPassword('');
      onSuccess?.();
    }
    
    setLoading(false);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-10"
          />
        </div>
        <div className="flex-1">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="h-10"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity h-10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-elegant)] border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="transition-all focus:shadow-[var(--shadow-soft)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="transition-all focus:shadow-[var(--shadow-soft)]"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
