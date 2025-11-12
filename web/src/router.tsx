import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/auth-page';
import { ProfilePage } from '@/pages/profile-page';
import TeacherDashboard from '@/pages/teacher-dashboard';
import SchedulesListPage from '@/pages/schedules-list-page';
import CreateSchedulePage from '@/pages/create-schedule-page';
import ScheduleDetailPage from '@/pages/schedule-detail-page';
import PendingAttendancesPage from '@/pages/pending-attendances-page';
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
          {/* Dashboard - Redirect to teacher dashboard (only TEACHER role) */}
          <Route 
            path="/dashboard" 
            element={<Navigate to="/teacher/dashboard" replace />} 
          />
          
          {/* Teacher Dashboard */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Attendance - QR-based */}
          <Route path="/attendance/pending" element={<PendingAttendancesPage />} />
          
          {/* Schedules - QR-based */}
          <Route path="/schedules" element={<SchedulesListPage />} />
          <Route path="/schedules/create" element={<CreateSchedulePage />} />
          <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
        </Route>
        
        {/* Default redirect - always to teacher dashboard */}
        <Route
          path="/"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/teacher/dashboard" replace />
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
