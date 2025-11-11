import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, QrCode, Ban } from "lucide-react"
import { useState, useEffect } from "react"
import { scheduleService, Schedule } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function MySchedule() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchSchedules = async () => {
    try {
      const allSchedules = await scheduleService.getMySchedules()
      
      // Filter upcoming schedules (today and future, show both ACTIVE and SCHEDULED)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const upcomingSchedules = allSchedules
        .filter(schedule => {
          const scheduleDate = new Date(schedule.date)
          scheduleDate.setHours(0, 0, 0, 0)
          // Show schedules that are ACTIVE or SCHEDULED (not CLOSED)
          return scheduleDate >= today && schedule.status !== 'CLOSED'
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) // Show only next 5
      
      setSchedules(upcomingSchedules)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleQR = async (e: React.MouseEvent, scheduleId: string, currentStatus: string) => {
    e.stopPropagation() // Prevent card click navigation
    
    setTogglingId(scheduleId)
    try {
      // Toggle between ACTIVE and SCHEDULED
      const newStatus: 'ACTIVE' | 'SCHEDULED' = currentStatus === 'ACTIVE' ? 'SCHEDULED' : 'ACTIVE'
      
      // Use updateScheduleStatus endpoint
      await scheduleService.updateScheduleStatus(scheduleId, newStatus)
      
      // Update local state
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, status: newStatus }
            : schedule
        )
      )
      
      toast({
        title: newStatus === 'ACTIVE' ? 'QR Code Diaktifkan' : 'QR Code Dinonaktifkan',
        description: newStatus === 'ACTIVE' 
          ? 'Mahasiswa dapat melakukan presensi' 
          : 'Presensi ditutup untuk jadwal ini',
      })
    } catch (error) {
      console.error('Failed to toggle QR status:', error)
      toast({
        title: 'Gagal',
        description: 'Tidak dapat mengubah status QR code',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Jadwal Mendatang</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Memuat data...
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
            <CardTitle className="text-base sm:text-lg">Jadwal Mendatang</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {schedules.length === 0 
                ? 'Tidak ada jadwal' 
                : `${schedules.length} jadwal terdekat`
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/schedules/create')}
          >
            Buat Jadwal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada jadwal mendatang
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="space-y-1 min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigate(`/schedules/${schedule.id}`)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">
                      {schedule.courseName}
                    </p>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                      {schedule.courseCode}
                    </Badge>
                    {schedule.status === 'ACTIVE' ? (
                      <Badge variant="default" className="text-[10px] bg-green-500 hover:bg-green-600">
                        <QrCode className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        <Ban className="h-3 w-3 mr-1" />
                        Nonaktif
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {schedule.topic}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(schedule.date).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    {schedule.room && (
                      <Badge variant="secondary" className="text-[10px]">
                        {schedule.room}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant={schedule.status === 'ACTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className={schedule.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600 text-white'}
                  onClick={(e) => handleToggleQR(e, schedule.id, schedule.status)}
                  disabled={togglingId === schedule.id}
                >
                  {togglingId === schedule.id ? (
                    'Loading...'
                  ) : schedule.status === 'ACTIVE' ? (
                    <>
                      <Ban className="h-4 w-4 mr-1" />
                      Nonaktifkan
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-1" />
                      Aktifkan
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
