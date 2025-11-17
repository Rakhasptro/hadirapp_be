import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin,
  BookOpen,
  Search,
  Loader2,
  Eye
} from 'lucide-react';
import { scheduleService, Schedule } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SchedulesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getMySchedules();
      setSchedules(data);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat jadwal',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => 
    schedule.courseName.toLowerCase().includes(search.toLowerCase()) ||
    schedule.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    schedule.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Perkuliahan</h1>
          <p className="text-muted-foreground mt-1">
            Kelola jadwal dan QR Code absensi
          </p>
        </div>
        <Button onClick={() => navigate('/schedules/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Jadwal Baru
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama atau kode mata kuliah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSchedules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'Tidak ada hasil' : 'Belum ada jadwal'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search 
                ? 'Coba ubah kata kunci pencarian' 
                : 'Mulai dengan membuat jadwal perkuliahan pertama Anda'}
            </p>
            {!search && (
              <Button onClick={() => navigate('/schedules/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Jadwal Baru
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedules Grid */}
      {!loading && filteredSchedules.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map((schedule) => (
            <Card 
              key={schedule.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/schedules/${schedule.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{schedule.courseName}</CardTitle>
                <CardDescription>{schedule.courseCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(schedule.date).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{schedule.startTime} - {schedule.endTime}</span>
                </div>
                {schedule.room && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{schedule.room}</span>
                  </div>
                )}
                {schedule.topic && (
                  <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="line-clamp-2 flex-1">{schedule.topic}</span>
                  </div>
                )}
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/schedules/${schedule.id}`);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}