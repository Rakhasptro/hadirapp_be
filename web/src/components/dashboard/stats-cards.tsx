import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, School, UserCog } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  attendanceToday: number
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminCount, setAdminCount] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await axios.get('/admin/stats')
        setStats(statsResponse.data)

        // Fetch admin count from users endpoint
        const usersResponse = await axios.get('/admin/users')
        const admins = usersResponse.data.filter((user: any) => user.role === 'ADMIN')
        setAdminCount(admins.length)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const cards = [
    {
      title: "Total Siswa",
      value: stats?.totalStudents || 0,
      icon: Users,
      description: "Siswa terdaftar",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Guru",
      value: stats?.totalTeachers || 0,
      icon: GraduationCap,
      description: "Guru aktif",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Kelas",
      value: stats?.totalClasses || 0,
      icon: School,
      description: "Kelas aktif",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Total Admin",
      value: adminCount,
      icon: UserCog,
      description: "Administrator",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stat.value.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
