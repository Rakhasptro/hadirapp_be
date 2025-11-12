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
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Redirect to teacher dashboard (only TEACHER role exists)
      if (response.user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        // Fallback for any other role
        navigate('/teacher/dashboard');
      }
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
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Selamat Datang</h1>
                <p className="text-muted-foreground text-balance">
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
                      e.preventDefault();
                      // TODO: Add forgot password functionality
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

              <FieldDescription className="text-center">
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
          
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 text-primary"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M7 7h.01"/>
                    <path d="M7 12h.01"/>
                    <path d="M7 17h.01"/>
                    <path d="M12 7h5"/>
                    <path d="M12 12h5"/>
                    <path d="M12 17h5"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">HadirApp</h2>
                <p className="text-muted-foreground">
                  Sistem presensi modern dengan teknologi QR Code untuk kemudahan dan keamanan
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FieldDescription className="px-6 text-center text-xs">
        Dengan melanjutkan, Anda menyetujui{' '}
        <a href="#" className="underline">Syarat & Ketentuan</a> dan{' '}
        <a href="#" className="underline">Kebijakan Privasi</a> kami
      </FieldDescription>
    </div>
  );
}
