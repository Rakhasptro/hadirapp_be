import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface Schedule {
  id: string
  date: string
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED'
}

interface Attendance {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
}

export function TeacherStatsCards() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, attendancesRes] = await Promise.all([
          axios.get('/schedules'),
          axios.get('/attendance/pending')
        ])
        setSchedules(schedulesRes.data)
        setAttendances(attendancesRes.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaySchedules = schedules.filter(s => {
    const scheduleDate = new Date(s.date)
    scheduleDate.setHours(0, 0, 0, 0)
    return scheduleDate.getTime() === today.getTime()
  })

  const activeSchedules = todaySchedules.filter(s => s.status === 'ACTIVE')
  const pendingAttendances = attendances.filter(a => a.status === 'PENDING')

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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

  const cards = [
    {
      title: "Jadwal Hari Ini",
      value: todaySchedules.length,
      icon: Calendar,
      description: "Total jadwal",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "QR Code Aktif",
      value: activeSchedules.length,
      icon: CheckCircle,
      description: "Sedang berlangsung",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Pending Review",
      value: pendingAttendances.length,
      icon: Clock,
      description: "Menunggu konfirmasi",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
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
