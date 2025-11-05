import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Eye, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: 'OPEN' | 'CLOSED';
  description: string;
  topic: string;
  course: string;
  class: string;
  teacher: string;
  teacherEmail: string;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  attendanceCount: number;
}

export default function AttendanceSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await axios.get('/admin/attendance/sessions', { params });
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      setError(err.response?.data?.message || 'Gagal memuat data sesi absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup sesi ini?')) {
      return;
    }

    try {
      await axios.post(`/attendance/session/${sessionId}/close`);
      alert('Sesi berhasil ditutup');
      fetchSessions();
    } catch (err: any) {
      console.error('Error closing session:', err);
      alert(err.response?.data?.message || 'Gagal menutup sesi');
    }
  };

  const handleViewDetail = (sessionId: string) => {
    navigate(`/attendance/sessions/${sessionId}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return <Badge className="bg-green-500">Aktif</Badge>;
    }
    return <Badge variant="secondary">Ditutup</Badge>;
  };

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      session.course.toLowerCase().includes(searchLower) ||
      session.class.toLowerCase().includes(searchLower) ||
      session.teacher.toLowerCase().includes(searchLower) ||
      session.topic?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAttendanceRate = (present: number, late: number, total: number) => {
    if (total === 0) return 0;
    return Math.round(((present + late) / total) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sesi Absensi</h1>
        <p className="text-muted-foreground">Kelola dan pantau semua sesi absensi</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari</label>
              <Input
                placeholder="Cari mata pelajaran, kelas, guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="OPEN">Aktif</SelectItem>
                  <SelectItem value="CLOSED">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <div className="grid gap-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Tidak ada sesi absensi ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const attendanceRate = getAttendanceRate(
              session.present,
              session.late,
              session.totalStudents
            );

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-xl">{session.course}</CardTitle>
                      <CardDescription className="text-base">
                        {session.class} • {session.teacher}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Session Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">
                        {formatTime(session.startTime)}
                        {session.endTime && ` - ${formatTime(session.endTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{session.totalStudents} Siswa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm font-medium">{attendanceRate}% Kehadiran</span>
                    </div>
                  </div>

                  {/* Topic */}
                  {session.topic && (
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <p className="text-sm">
                        <span className="font-semibold">Topik:</span>{' '}
                        <span className="text-muted-foreground">{session.topic}</span>
                      </p>
                    </div>
                  )}

                  {/* Attendance Stats */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">Hadir:</span> {session.present}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">Terlambat:</span> {session.late}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">Tidak Hadir:</span> {session.absent}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(session.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                    {session.status === 'OPEN' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCloseSession(session.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Tutup Sesi
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2 p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold">{filteredSessions.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Sesi</p>
              </div>
              <div className="text-center space-y-2 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredSessions.filter((s) => s.status === 'OPEN').length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Sesi Aktif</p>
              </div>
              <div className="text-center space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {filteredSessions.filter((s) => s.status === 'CLOSED').length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Sesi Ditutup</p>
              </div>
              <div className="text-center space-y-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredSessions.reduce((acc, s) => acc + s.present, 0)}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Total Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
