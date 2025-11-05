import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Wifi } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface Schedule {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  courses: {
    name: string
    code: string
  }
  classes: {
    name: string
    grade: string
  }
  wifi_networks?: {
    ssid: string
  }
}

const dayOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
}

const dayNames: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
}

export function MySchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('/teachers/my-schedule')
        setSchedules(response.data)
      } catch (error) {
        console.error('Failed to fetch schedules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Jadwal Mengajar</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Memuat data...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Group by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(schedule)
    return acc
  }, {} as Record<string, Schedule[]>)

  // Sort days
  const sortedDays = Object.keys(schedulesByDay).sort((a, b) => dayOrder[a] - dayOrder[b])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Jadwal Mengajar</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {schedules.length} jadwal aktif
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada jadwal mengajar
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDays.map((day) => (
              <div key={day} className="space-y-2">
                <h3 className="font-semibold text-sm">{dayNames[day]}</h3>
                <div className="space-y-2">
                  {schedulesByDay[day].map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">
                            {schedule.courses.name}
                          </p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                            {schedule.courses.code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {schedule.classes.name} ({schedule.classes.grade})
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          {schedule.room && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{schedule.room}</span>
                            </div>
                          )}
                          {schedule.wifi_networks && (
                            <div className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              <span>{schedule.wifi_networks.ssid}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
