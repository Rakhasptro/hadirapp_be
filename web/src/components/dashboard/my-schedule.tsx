import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface Schedule {
  id: string
  courseName: string
  courseCode: string
  date: string
  startTime: string
  endTime: string
  room: string | null
  topic: string | null
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED'
}

export function MySchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('/schedules')
        // Filter untuk jadwal minggu ini saja
        const today = new Date()
        const weekFromNow = new Date(today)
        weekFromNow.setDate(today.getDate() + 7)
        
        const filtered = response.data.filter((schedule: Schedule) => {
          const scheduleDate = new Date(schedule.date)
          return scheduleDate >= today && scheduleDate <= weekFromNow
        })
        
        // Sort by date
        filtered.sort((a: Schedule, b: Schedule) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        
        setSchedules(filtered)
      } catch (error) {
        console.error('Failed to fetch schedules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600 text-white">Aktif</Badge>
      case 'CLOSED':
        return <Badge variant="destructive">Ditutup</Badge>
      default:
        return <Badge variant="secondary">Terjadwal</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Jadwal Minggu Ini</CardTitle>
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
        <CardTitle className="text-base sm:text-lg">Jadwal Minggu Ini</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {schedules.length} jadwal dalam 7 hari ke depan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada jadwal untuk minggu ini
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">
                      {schedule.courseName}
                    </p>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                      {schedule.courseCode}
                    </Badge>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(schedule.date)}</span>
                    </div>
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
                  </div>
                  {schedule.topic && (
                    <p className="text-xs text-muted-foreground italic">
                      Topik: {schedule.topic}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
