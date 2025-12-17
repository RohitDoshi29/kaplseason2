import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

export function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const { isAuthenticated, hasPassword, isLoaded, setPassword, login } = useAdminAuth();
  const [password, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPassword(password);
    toast.success('Admin password set successfully!');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success('Welcome back, Admin!');
    } else {
      toast.error('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            {hasPassword ? <Lock className="w-8 h-8 text-primary" /> : <KeyRound className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl">
            {hasPassword ? 'Admin Login' : 'Set Admin Password'}
          </CardTitle>
          <CardDescription>
            {hasPassword
              ? 'Enter your password to access the admin panel'
              : 'Create a password to secure the admin panel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={hasPassword ? handleLogin : handleSetPassword} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="h-12"
              />
            </div>
            {!hasPassword && (
              <div>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                />
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-lg">
              {hasPassword ? 'Login' : 'Set Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
