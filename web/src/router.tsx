import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/auth-page';
import { ProfilePage } from '@/pages/profile-page';
import { DashboardContent } from '@/pages/dashboard-content';
import AttendanceSessionsPage from '@/pages/attendance-sessions-page';
import SessionDetailPage from '@/pages/session-detail-page';
import SchedulesPage from '@/pages/schedules-page';
import ScheduleFormPage from '@/pages/schedule-form-page';
import UsersPage from '@/pages/users-page';
import UserFormPage from '@/pages/user-form-page';
import ResetPasswordPage from '@/pages/reset-password-page';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MainLayout } from '@/components/layout/main-layout';
import { authService } from '@/lib/auth';

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">403 - Unauthorized</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardContent />} />
          
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Attendance */}
          <Route path="/attendance/sessions" element={<AttendanceSessionsPage />} />
          <Route path="/attendance/sessions/:id" element={<SessionDetailPage />} />
          
          {/* Schedules */}
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/schedules/create" element={<ScheduleFormPage />} />
          <Route path="/schedules/edit/:id" element={<ScheduleFormPage />} />
          
          {/* Users Management */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/create" element={<UserFormPage />} />
          <Route path="/users/edit/:id" element={<UserFormPage />} />
          <Route path="/users/:id/reset-password" element={<ResetPasswordPage />} />
        </Route>
        
        {/* Legacy routes - redirect to unified dashboard */}
        <Route
          path="/admin/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        
        <Route
          path="/teacher/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        
        <Route
          path="/student/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        
        {/* Default redirect */}
        <Route
          path="/"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
