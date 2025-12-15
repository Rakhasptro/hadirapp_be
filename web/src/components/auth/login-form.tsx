import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authService } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToForgot?: () => void;
  onSwitchToRegister?: () => void;
  className?: string;
}

 export function LoginForm({ onSwitchToForgot, onSwitchToRegister, className }: LoginFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login({
        email: formData.email,
        password: formData.password
      });
      navigate('/teacher/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      console.error('Request data:', { email: formData.email, password: '***' });

      type RespErr = { response?: { data?: { message?: string; error?: string } }; message?: string }
      const e = err as RespErr
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      
      // Auto-dismiss error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-1">
              <div className="flex flex-col gap-1 text-center mb-2">
                <h1 className="text-3xl font-bold">Selamat Datang</h1>
                <p className="text-sm text-muted-foreground">
                  Login ke HadirApp - Sistem Presensi QR
                </p>
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-primary"
                    onClick={e => {
                      e.preventDefault();
                      if (typeof onSwitchToForgot === 'function') onSwitchToForgot();
                    }}
                    disabled={isLoading}
                  >
                    Lupa password?
                  </button>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </Field>
            </FieldGroup>
            <div className="mt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
            </div>
          </form>
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">Belum punya akun?</span>{' '}
            <button
              type="button"
              className="text-primary text-sm font-medium hover:underline ml-1"
              onClick={() => {
                if (typeof onSwitchToRegister === 'function') onSwitchToRegister();
              }}
              disabled={isLoading}
            >
              Daftar Akun Teacher
            </button>
          </div>
        </CardContent>
      </Card>
       <p className="text-center text-xs text-muted-foreground mt-4">
            Dengan melanjutkan, Anda menyetujui{' '}
            <a href="#" className="underline hover:text-foreground">Syarat & Ketentuan</a> dan{' '}
            <a href="#" className="underline hover:text-foreground">Kebijakan Privasi</a> kami
          </p>
    </div>
  );
}
