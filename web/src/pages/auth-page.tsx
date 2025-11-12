import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { authService } from '@/lib/auth';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSwitchToRegister = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);
  const handleRegisterSuccess = () => {
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            HadirApp
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistem Manajemen Kehadiran
          </p>
        </div>

        {/* Form */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={handleSwitchToRegister} />
        ) : (
          <div className="flex justify-center">
            <RegisterForm 
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleRegisterSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}
