import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authService } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  className?: string;
}

export function LoginForm({ onSwitchToRegister, className }: LoginFormProps) {
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
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Request data:', { email: formData.email, password: '***' });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
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
            <FieldGroup className="space-y-2">
              <div className="flex flex-col gap-2 text-center mb-2">
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
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    Lupa password?
                  </a>
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
              
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Field>

              <FieldDescription className="text-center text-sm">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                >
                  Daftar
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
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
