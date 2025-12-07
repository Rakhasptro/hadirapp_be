import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      toast.error('Password tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      toast.error('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.resetPassword({ email, newPassword, confirmPassword });
      setSuccess(true);
      toast.success(result.message || 'Password berhasil diubah! Silakan login dengan password baru.');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: unknown) {
      type RespErr = { response?: { data?: { message?: string } } }
      const e = err as RespErr
      const message = e.response?.data?.message || 'Gagal reset password. Email tidak ditemukan.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Masukkan email yang terdaftar dan password baru Anda.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-md">
              Password berhasil diubah! Silakan login dengan password baru.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || success}
              minLength={6}
            />
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full mt-2" disabled={loading || success}>
            {loading ? 'Memproses...' : success ? 'Berhasil!' : 'Reset Password'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Sudah ingat password?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              Login di sini
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
