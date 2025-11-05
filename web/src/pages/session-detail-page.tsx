import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Student {
  id: string;
  name: string;
  email: string;
  nis: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  checkInTime: string | null;
  notes: string | null;
}

interface SessionDetail {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: 'OPEN' | 'CLOSED';
  description: string;
  topic: string;
  notes: string;
  course: string;
  class: string;
  teacher: string;
  teacherEmail: string;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  students: Student[];
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSessionDetail();
    }
  }, [id]);

  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/attendance/sessions/${id}`);
      setSession(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching session detail:', err);
      setError(err.response?.data?.message || 'Gagal memuat detail sesi');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!confirm('Apakah Anda yakin ingin menutup sesi ini?')) {
      return;
    }

    try {
      await axios.post(`/attendance/session/${id}/close`);
      alert('Sesi berhasil ditutup');
      fetchSessionDetail();
    } catch (err: any) {
      console.error('Error closing session:', err);
      alert(err.response?.data?.message || 'Gagal menutup sesi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge className="bg-green-500">Hadir</Badge>;
      case 'LATE':
        return <Badge className="bg-yellow-500">Terlambat</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive">Tidak Hadir</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSessionStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return <Badge className="bg-green-500">Aktif</Badge>;
    }
    return <Badge variant="secondary">Ditutup</Badge>;
  };

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

  const getAttendanceRate = () => {
    if (!session || session.totalStudents === 0) return 0;
    return Math.round(((session.present + session.late) / session.totalStudents) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6">
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500 mb-4">{error || 'Sesi tidak ditemukan'}</p>
            <Button onClick={() => navigate('/attendance/sessions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/attendance/sessions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{session.course}</h1>
            <p className="text-muted-foreground text-base">{session.class}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getSessionStatusBadge(session.status)}
          {session.status === 'OPEN' && (
            <Button variant="destructive" onClick={handleCloseSession}>
              <Lock className="h-4 w-4 mr-2" />
              Tutup Sesi
            </Button>
          )}
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Informasi Sesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Guru Pengajar</p>
              <p className="text-lg font-semibold">{session.teacher}</p>
              <p className="text-sm text-muted-foreground">{session.teacherEmail}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</p>
              <div className="space-y-2">
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
              </div>
            </div>
          </div>

          {session.topic && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Topik Pembelajaran</p>
              <p className="text-base">{session.topic}</p>
            </div>
          )}

          {session.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p className="text-base">{session.description}</p>
            </div>
          )}

          {session.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Catatan</p>
              <p className="text-base">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Statistik Kehadiran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-muted/50 rounded-xl space-y-2">
              <Users className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-3xl font-bold">{session.totalStudents}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Siswa</p>
            </div>
            <div className="text-center p-5 bg-green-50 dark:bg-green-950/30 rounded-xl space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {session.present}
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hadir</p>
            </div>
            <div className="text-center p-5 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-yellow-500" />
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {session.late}
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Terlambat</p>
            </div>
            <div className="text-center p-5 bg-red-50 dark:bg-red-950/30 rounded-xl space-y-2">
              <XCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{session.absent}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tidak Hadir</p>
            </div>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <p className="text-center space-y-2">
              <span className="block text-4xl font-bold text-blue-600 dark:text-blue-400">
                {getAttendanceRate()}%
              </span>
              <span className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Tingkat Kehadiran
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Kehadiran Siswa</CardTitle>
          <CardDescription className="text-base mt-1">
            {session.students.length} dari {session.totalStudents} siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu Check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada data kehadiran
                  </TableCell>
                </TableRow>
              ) : (
                session.students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.nis}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      {student.checkInTime ? formatTime(student.checkInTime) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
