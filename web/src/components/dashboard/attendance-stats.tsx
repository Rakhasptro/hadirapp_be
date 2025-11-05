import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface TodayAttendance {
  total: number
  present: number
  late: number
  absent: number
}

export function AttendanceStats() {
  const [data, setData] = useState<TodayAttendance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/admin/attendance/today-stats')
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch today attendance stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    // Refresh every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Statistik Kehadiran Hari Ini</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Memuat data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      label: "Hadir",
      value: data.present,
      percentage: data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : "0.0",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      badgeVariant: "default" as const,
    },
    {
      label: "Terlambat",
      value: data.late,
      percentage: data.total > 0 ? ((data.late / data.total) * 100).toFixed(1) : "0.0",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      badgeVariant: "secondary" as const,
    },
    {
      label: "Tidak Hadir",
      value: data.absent,
      percentage: data.total > 0 ? ((data.absent / data.total) * 100).toFixed(1) : "0.0",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      badgeVariant: "destructive" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Statistik Kehadiran Hari Ini</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Total {data.total.toLocaleString()} siswa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`rounded-lg p-1.5 sm:p-2 ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {stat.value.toLocaleString()} siswa
                  </p>
                </div>
              </div>
              <Badge variant={stat.badgeVariant} className="text-xs flex-shrink-0">
                {stat.percentage}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
