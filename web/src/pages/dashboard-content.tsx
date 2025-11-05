import { authService } from "@/lib/auth"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeacherStatsCards } from "@/components/dashboard/teacher-stats-cards"
import { AttendanceStats } from "@/components/dashboard/attendance-stats"
import { ActiveSessions } from "@/components/dashboard/active-sessions"
import { RecentNotifications } from "@/components/dashboard/recent-notifications"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { MySchedule } from "@/components/dashboard/my-schedule"

export function DashboardContent() {
  const user = authService.getUser()
  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Stats Cards - Different for each role */}
      {isAdmin && <StatsCards />}
      {isTeacher && <TeacherStatsCards />}
      
      {/* Main Content Grid */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-7">
        {isAdmin && (
          <>
            {/* Attendance Chart - 4 columns */}
            <div className="md:col-span-4">
              <AttendanceChart />
            </div>
            
            {/* Attendance Stats - 3 columns */}
            <div className="md:col-span-3">
              <AttendanceStats />
            </div>
          </>
        )}
        
        {isTeacher && (
          <>
            {/* My Schedule - 4 columns */}
            <div className="md:col-span-4">
              <MySchedule />
            </div>
            
            {/* Active Sessions - 3 columns */}
            <div className="md:col-span-3">
              <ActiveSessions />
            </div>
          </>
        )}
      </div>
      
      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {isAdmin && (
          <>
            <ActiveSessions />
            <RecentNotifications />
          </>
        )}
        
        {isTeacher && (
          <div className="md:col-span-2">
            <RecentNotifications />
          </div>
        )}
      </div>
    </div>
  )
}
