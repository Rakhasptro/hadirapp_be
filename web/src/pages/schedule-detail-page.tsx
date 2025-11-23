import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  QrCode, 
  Clock, 
  MapPin, 
  BookOpen,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Ban,
  Power
} from 'lucide-react';
import { scheduleService, attendanceService, Schedule, Attendance } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleData, attendanceData] = await Promise.all([
        scheduleService.getScheduleById(id!),
        attendanceService.getScheduleAttendances(id!),
      ]);
      setSchedule(scheduleData);
      setAttendances(attendanceData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (attendanceId: string) => {
    setConfirmingId(attendanceId);
    try {
      await attendanceService.confirmAttendance(attendanceId);
      toast({
        title: 'Berhasil',
        description: 'Kehadiran telah dikonfirmasi',
      });
      await fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengkonfirmasi',
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (attendanceId: string) => {
    // open dialog to collect reason
    setPendingRejectId(attendanceId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const submitReject = async () => {
    if (!pendingRejectId) return;
    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Alasan kosong', description: 'Masukkan alasan penolakan' });
      return;
    }

    setRejectingId(pendingRejectId);
    try {
      await attendanceService.rejectAttendance(pendingRejectId, rejectReason.trim());
      toast({ title: 'Berhasil', description: 'Kehadiran telah ditolak' });
      setRejectDialogOpen(false);
      setPendingRejectId(null);
      setRejectReason('');
      await fetchData(); // Refresh data
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Gagal menolak' });
    } finally {
      setRejectingId(null);
    }
  };

  const handleDownloadQR = () => {
    if (!schedule?.qrCodeImage) return;
    
    const link = document.createElement('a');
    link.href = schedule.qrCodeImage;
    link.download = `QR-${schedule.courseCode}-${schedule.date}.png`;
    link.click();
  };

  const handleExportCSV = async () => {
    try {
      const blob = await attendanceService.exportToCSV(id!);
      attendanceService.downloadFile(
        blob, 
        `attendance-${schedule?.courseCode}-${schedule?.date}.csv`
      );
      toast({
        title: 'Berhasil',
        description: 'Data absensi berhasil diexport',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengexport data',
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!schedule) return;
    
    setTogglingStatus(true);
    try {
      // Toggle between ACTIVE and SCHEDULED
      const newStatus: 'ACTIVE' | 'SCHEDULED' = schedule.status === 'ACTIVE' ? 'SCHEDULED' : 'ACTIVE'
      
      await scheduleService.updateScheduleStatus(schedule.id, newStatus)
      
      // Update local state
      setSchedule({ ...schedule, status: newStatus });
      
      toast({
        title: newStatus === 'ACTIVE' ? 'QR Code Diaktifkan' : 'QR Code Dinonaktifkan',
        description: newStatus === 'ACTIVE' 
          ? 'Mahasiswa dapat melakukan presensi' 
          : 'Presensi ditutup untuk jadwal ini',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengubah status',
      });
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Jadwal tidak ditemukan</p>
            <Button onClick={() => navigate('/schedules')} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
          
    );
  }

  const pendingCount = attendances.filter(a => a.status === 'PENDING').length;
  const confirmedCount = attendances.filter(a => a.status === 'CONFIRMED').length;
  const rejectedCount = attendances.filter(a => a.status === 'REJECTED').length;

  return (
    <div className="container max-w-7xl py-6 px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/schedules')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{schedule.courseName}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {schedule.courseCode} • {new Date(schedule.date).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Badge 
              variant={
                schedule.status === 'ACTIVE' ? 'default' : 
                schedule.status === 'SCHEDULED' ? 'secondary' : 
                'outline'
              }
              className={
                schedule.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' :
                schedule.status === 'SCHEDULED' ? 'bg-gray-500' : 
                'bg-orange-500'
              }
            >
              {schedule.status === 'ACTIVE' && <QrCode className="h-6 w-3 mr-1" />}
              {schedule.status === 'SCHEDULED' && <Ban className="h-6 w-3 mr-1" />}
              {schedule.status === 'CLOSED' && <CheckCircle className="h-8 w-3 mr-1" />}
              {schedule.status}
            </Badge>
            <Button
              variant={schedule.status === 'ACTIVE' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleToggleStatus}
              disabled={togglingStatus || schedule.status === 'CLOSED'}
              className={schedule.status !== 'ACTIVE' && schedule.status !== 'CLOSED' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {togglingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : schedule.status === 'ACTIVE' ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Nonaktifkan QR
                </>
              ) : schedule.status === 'CLOSED' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Selesai
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Aktifkan QR
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* QR Code Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Absensi
            </CardTitle>
            <CardDescription>
              Mahasiswa scan QR ini untuk absen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.qrCodeImage && (
              <div className="bg-white p-4 rounded-lg border flex justify-center">
                <img 
                  src={schedule.qrCodeImage} 
                  alt="QR Code"
                  className="w-40 h-40 sm:w-56 sm:h-56 object-contain mx-auto"
                />
              </div>
            )}
            <Button 
              onClick={handleDownloadQR} 
              variant="outline" 
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>

            {/* Schedule Info */}
            <div className="space-y-3 pt-4 border-t">
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
                  <span className="flex-1">{schedule.topic}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Daftar Kehadiran
                </CardTitle>
                <CardDescription>
                  Total: {attendances.length} mahasiswa
                </CardDescription>
              </div>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              <div className="text-center p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-green-600">{confirmedCount}</p>
                <p className="text-xs text-green-600">Confirmed</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-lg sm:text-2xl font-bold text-red-600">{rejectedCount}</p>
                <p className="text-xs text-red-600">Rejected</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendances.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada mahasiswa yang absen
                </p>
              ) : (
                attendances.map((attendance) => (
                  <div 
                    key={attendance.id}
                    className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg"
                  >
                    {/* Selfie */}
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/${attendance.selfieImage}`}
                      alt={attendance.studentName}
                      className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover mb-2 sm:mb-0"
                    />

                    {/* Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-base sm:text-lg">{attendance.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{attendance.studentNpm}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(attendance.scannedAt).toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            attendance.status === 'CONFIRMED' ? 'default' :
                            attendance.status === 'REJECTED' ? 'destructive' : 'secondary'
                          }
                        >
                          {attendance.status}
                        </Badge>
                      </div>

                      {/* Actions for PENDING */}
                      {attendance.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3 flex-col sm:flex-row w-full">
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(attendance.id)}
                            disabled={confirmingId === attendance.id}
                            className="w-full sm:w-auto"
                          >
                            {confirmingId === attendance.id ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-3 w-3" />
                            )}
                            Konfirmasi
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(attendance.id)}
                            disabled={rejectingId === attendance.id}
                            className="w-full sm:w-auto"
                          >
                            {rejectingId === attendance.id ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-3 w-3" />
                            )}
                            Tolak
                          </Button>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {attendance.status === 'REJECTED' && attendance.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">
                          Alasan: {attendance.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan penolakan</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk kehadiran ini.</DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={submitReject} disabled={rejectingId !== null}>Kirim Penolakan</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
