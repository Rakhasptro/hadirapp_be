import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  CheckCircle,
  Clock,
  
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { teacherService, attendanceService, Attendance } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { getImageUrl } from '@/lib/utils';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getUser();
  const displayName = typeof user?.profile?.name === 'string'
    ? user.profile.name
    : (typeof user?.email === 'string' ? user.email : 'User');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchedules: 0,
    todaySchedules: 0,
    totalAttendances: 0,
    pendingAttendances: 0,
  });
  const [pendingAttendances, setPendingAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, pendingList] = await Promise.all([
        teacherService.getDashboardStats(),
        attendanceService.getPendingAttendances(),
      ]);
      setStats(dashboardStats);
      setPendingAttendances(pendingList.slice(0, 5)); // Show only 5
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickConfirm = async (attendanceId: string) => {
    try {
      await attendanceService.confirmAttendance(attendanceId);
      toast({
        title: 'Berhasil',
        description: 'Kehadiran telah dikonfirmasi',
      });
      fetchDashboardData(); // Refresh
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengkonfirmasi',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Selamat Datang, {displayName}!</h1>
        <p className="text-muted-foreground mt-1">
          Kelola jadwal dan validasi kehadiran mahasiswa
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jadwal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">
              Jadwal perkuliahan Anda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySchedules}</div>
            <p className="text-xs text-muted-foreground">
              Perkuliahan hari ini
            </p>
          </CardContent>
        </Card>

        {/* Total Kehadiran card removed per request */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Validasi</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAttendances}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu konfirmasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert banner for pending attendances */}
      {stats.pendingAttendances > 0 && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-5 w-5 text-yellow-700" />
          <div>
            <AlertTitle>Perlu validasi kehadiran ({stats.pendingAttendances})</AlertTitle>
            <AlertDescription>
              Terdapat {stats.pendingAttendances} absen menunggu konfirmasi. Klik tombol "Lihat Semua" di bawah untuk meninjau.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Pending Attendances */}
      {pendingAttendances.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg md:text-xl">Kehadiran Perlu Validasi</CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Mahasiswa yang baru scan QR dan menunggu konfirmasi
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/attendance/pending')} className="w-full sm:w-auto">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="space-y-3">
              {pendingAttendances.map((attendance) => (
                <div 
                  key={attendance.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={getImageUrl(attendance.selfieImage)}
                      alt={attendance.studentName}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{attendance.studentName}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{attendance.studentNpm}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {attendance.schedule?.courseName} • {new Date(attendance.scannedAt).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleQuickConfirm(attendance.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="mr-1 md:mr-2 h-3 w-3" />
                      <span className="text-xs md:text-sm">Konfirmasi</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/schedules/${attendance.scheduleId}`)}
                      className="flex-1 sm:flex-none"
                    >
                      <span className="text-xs md:text-sm">Detail</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
