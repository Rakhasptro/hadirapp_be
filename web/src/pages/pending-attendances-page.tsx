import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Attendance {
  id: string;
  studentName: string;
  studentNpm: string;
  selfieImage: string;
  status: string;
  submittedAt: string;
  schedule: {
    courseName: string;
    courseCode: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
  };
}

export default function PendingAttendancesPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAttendances();
  }, []);

  const fetchPendingAttendances = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/attendance/pending');
      setAttendances(response.data);
    } catch (error: any) {
      console.error('Error fetching attendances:', error);
      const message = error.response?.data?.message || 'Gagal memuat data kehadiran. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      setActionLoading(true);
      await axios.patch(`/attendance/${id}/confirm`);
      toast.success('Kehadiran berhasil dikonfirmasi');
      fetchPendingAttendances();
    } catch (error: any) {
      console.error('Error confirming attendance:', error);
      const message = error.response?.data?.message || 'Gagal mengkonfirmasi kehadiran. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAttendance || !rejectionReason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    try {
      setActionLoading(true);
      await axios.patch(`/attendance/${selectedAttendance.id}/reject`, {
        reason: rejectionReason,
      });
      toast.success('Kehadiran berhasil ditolak');
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedAttendance(null);
      fetchPendingAttendances();
    } catch (error: any) {
      console.error('Error rejecting attendance:', error);
      const message = error.response?.data?.message || 'Gagal menolak kehadiran. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getSelfieUrl = (filename: string) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const apiBaseURL = baseURL.replace('/api', '');
    return `${apiBaseURL}/uploads/selfies/${filename}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kehadiran Pending</h1>
        <p className="text-muted-foreground">
          Konfirmasi atau tolak kehadiran mahasiswa
        </p>
      </div>

      {attendances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Tidak ada kehadiran pending</p>
            <p className="text-sm text-muted-foreground">
              Semua kehadiran sudah dikonfirmasi
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attendances.map((attendance) => (
            <Card key={attendance.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {attendance.studentName}
                    </CardTitle>
                    <CardDescription>{attendance.studentNpm}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Selfie Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  {attendance.selfieImage ? (
                    <img
                      src={getSelfieUrl(attendance.selfieImage)}
                      alt="Selfie"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Schedule Info */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">{attendance.schedule.courseName}</p>
                    <p className="text-muted-foreground">
                      {attendance.schedule.courseCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{attendance.schedule.room}</span>
                    <span>•</span>
                    <span>
                      {attendance.schedule.startTime} - {attendance.schedule.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {formatTime(attendance.submittedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleConfirm(attendance.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Konfirmasi
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedAttendance(attendance);
                      setShowRejectDialog(true);
                    }}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Tolak
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Kehadiran</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk mahasiswa{' '}
              {selectedAttendance?.studentName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Penolakan</Label>
            <Textarea
              id="reason"
              placeholder="Contoh: Selfie tidak jelas, bukan orang yang bersangkutan, dll"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
                setSelectedAttendance(null);
              }}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? 'Memproses...' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
