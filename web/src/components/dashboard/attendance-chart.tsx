import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

interface ChartData {
  date: string
  present: number
  late: number
  absent: number
}

export function AttendanceChart() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const endpoint = period === 'weekly' 
          ? '/admin/attendance/chart/weekly'
          : '/admin/attendance/chart/monthly'
        const response = await axios.get(endpoint)
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch attendance chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [period])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Grafik Kehadiran</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Statistik kehadiran {period === 'weekly' ? 'mingguan' : 'bulanan'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={period === 'weekly' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setPeriod('weekly')}
            >
              Mingguan
            </Badge>
            <Badge
              variant={period === 'monthly' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setPeriod('monthly')}
            >
              Bulanan
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {isLoading ? (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Memuat data...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Tidak ada data kehadiran</div>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
              <Bar 
                dataKey="present" 
                name="Hadir" 
                fill="hsl(142, 76%, 36%)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="late" 
                name="Terlambat" 
                fill="hsl(48, 96%, 53%)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="absent" 
                name="Tidak Hadir" 
                fill="hsl(0, 84%, 60%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
