import { TeacherStatsCards } from "@/components/dashboard/teacher-stats-cards"
import { MySchedule } from "@/components/dashboard/my-schedule"

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Stats Cards for Teacher */}
      <TeacherStatsCards />
      
      {/* My Schedule - Full Width */}
      <div className="w-full">
        <MySchedule />
      </div>
    </div>
  )
}
