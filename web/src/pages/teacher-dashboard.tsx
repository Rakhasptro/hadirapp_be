import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  QrCode,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { teacherService, attendanceService, Attendance } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getUser();
  
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
        <h1 className="text-3xl font-bold">Selamat Datang, {user?.profile?.name || user?.email}!</h1>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kehadiran</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">
              Mahasiswa sudah absen
            </p>
          </CardContent>
        </Card>

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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedules/create')}>
          <CardHeader>
            <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Buat Jadwal Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Buat jadwal perkuliahan dan generate QR Code untuk absensi mahasiswa
            </p>
            <Button className="w-full">
              Mulai Buat Jadwal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedules')}>
          <CardHeader>
            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg w-fit mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Lihat Semua Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola dan lihat detail semua jadwal perkuliahan Anda
            </p>
            <Button variant="outline" className="w-full">
              Buka Jadwal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/attendance/pending')}>
          <CardHeader>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-950 rounded-lg w-fit mb-2">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">Validasi Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {stats.pendingAttendances} kehadiran menunggu validasi Anda
            </p>
            <Button variant="outline" className="w-full">
              Lihat Pending
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Attendances */}
      {pendingAttendances.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kehadiran Perlu Validasi</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Mahasiswa yang baru scan QR dan menunggu konfirmasi
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/attendance/pending')}>
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAttendances.map((attendance) => (
                <div 
                  key={attendance.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/${attendance.selfieImage}`}
                    alt={attendance.studentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{attendance.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{attendance.studentNpm}</p>
                    <p className="text-xs text-muted-foreground">
                      {attendance.schedule?.courseName} • {new Date(attendance.scannedAt).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickConfirm(attendance.id)}
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Konfirmasi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/schedules/${attendance.scheduleId}`)}
                    >
                      Detail
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
