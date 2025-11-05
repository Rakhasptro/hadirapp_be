import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "@/lib/axios"

interface Session {
  id: string
  className: string
  subject: string
  teacher: string
  startTime: string
  endTime: string
  studentsPresent: number
  totalStudents: number
  room?: string
  dayOfWeek: string
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const response = await axios.get('/schedules/active')
        
        // Map response data to match our interface
        const mappedSessions = response.data.map((session: any) => ({
          id: session.id,
          className: session.classes?.name || 'N/A',
          subject: session.courses?.name || 'N/A',
          teacher: session.teachers?.name || 'N/A',
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.room,
          dayOfWeek: session.dayOfWeek,
          studentsPresent: session.attendance_sessions?.[0]?.attendances?.length || 0,
          totalStudents: session.classes?.students?.length || 0,
        }))
        
        setSessions(mappedSessions)
        setError(null)
      } catch (error: any) {
        console.error('Failed to fetch active sessions:', error)
        setError(error.response?.data?.message || 'Gagal memuat sesi aktif')
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
          <CardTitle className="text-base sm:text-lg">Sesi Absensi Aktif</CardTitle>
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
          <CardTitle className="text-base sm:text-lg">Sesi Absensi Aktif</CardTitle>
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
        <CardTitle className="text-base sm:text-lg">Sesi Absensi Aktif</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {sessions.length === 0 
            ? 'Tidak ada sesi yang sedang berlangsung' 
            : `${sessions.length} sesi sedang berlangsung`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada sesi yang sedang berlangsung saat ini
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sessions.map((session) => {
              const attendancePercentage = session.totalStudents > 0 
                ? (session.studentsPresent / session.totalStudents) * 100 
                : 0
              
              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm sm:text-base truncate">{session.className}</p>
                      <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                        {session.subject}
                      </Badge>
                      {session.room && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                          {session.room}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      Guru: {session.teacher}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {session.studentsPresent}/{session.totalStudents} siswa hadir
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      attendancePercentage === 100 
                        ? "default" 
                        : attendancePercentage >= 80 
                        ? "secondary" 
                        : "destructive"
                    }
                    className="text-xs self-start sm:self-auto flex-shrink-0"
                  >
                    {attendancePercentage.toFixed(0)}%
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
