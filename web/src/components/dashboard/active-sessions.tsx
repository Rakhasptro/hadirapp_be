import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, QrCode } from "lucide-react"
import { useEffect, useState } from "react"
import { scheduleService, Schedule } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function ActiveSessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const allSchedules = await scheduleService.getMySchedules()
        
        // Filter only today's active schedules
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todaySchedules = allSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.date)
          scheduleDate.setHours(0, 0, 0, 0)
          return scheduleDate.getTime() === today.getTime() && schedule.status === 'ACTIVE'
        })
        
        setSessions(todaySchedules)
        setError(null)
      } catch (error: any) {
        console.error('Failed to fetch active sessions:', error)
        setError(error.response?.data?.message || 'Gagal memuat jadwal hari ini')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveSessions()
    // Fetch new data every minute
    const interval = setInterval(fetchActiveSessions, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Jadwal Hari Ini</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Memuat data...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Jadwal Hari Ini</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Jadwal Hari Ini</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {sessions.length === 0 
                ? 'Tidak ada jadwal hari ini' 
                : `${sessions.length} jadwal perkuliahan`
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/schedules')}
          >
            Lihat Semua
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada jadwal perkuliahan hari ini
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/schedules/${session.id}`)}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm sm:text-base truncate">{session.courseName}</p>
                      <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                        {session.courseCode}
                      </Badge>
                      {session.room && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                          {session.room}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {session.topic}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <QrCode className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">QR Code tersedia</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={session.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-xs self-start sm:self-auto flex-shrink-0"
                  >
                    {session.status}
                  </Badge>
                </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
