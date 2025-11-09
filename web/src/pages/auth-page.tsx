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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            HadirApp
          </h1>
          <p className="text-muted-foreground">
            Sistem Manajemen Kehadiran
          </p>
        </div>

        {/* Form */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={handleSwitchToRegister} />
        ) : (
          <RegisterForm 
            onSwitchToLogin={handleSwitchToLogin}
            onSuccess={handleRegisterSuccess}
          />
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HadirApp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
