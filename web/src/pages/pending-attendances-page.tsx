import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Loader2,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import { attendanceService, Attendance } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function PendingAttendancesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingAttendances();
  }, []);

  const fetchPendingAttendances = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getPendingAttendances();
      setAttendances(data);
    } catch (error: any) {
      console.error('Error fetching attendances:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await attendanceService.confirmAttendance(id);
      toast({
        title: 'Berhasil',
        description: 'Kehadiran telah dikonfirmasi',
      });
      fetchPendingAttendances(); // Refresh
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengkonfirmasi',
      });
    }
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const submitReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Alasan kosong', description: 'Masukkan alasan penolakan' });
      return;
    }

    try {
      await attendanceService.rejectAttendance(rejectingId, rejectReason.trim());
      toast({ title: 'Berhasil', description: 'Kehadiran telah ditolak' });
      setRejectDialogOpen(false);
      setRejectingId(null);
      setRejectReason('');
      fetchPendingAttendances();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Gagal menolak' });
    }
  };

  const filteredAttendances = attendances.filter((att) => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentNpm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.schedule?.courseName?.toLowerCase().includes(searchQuery.toLowerCase());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attDate = new Date(att.scannedAt);
    attDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = attDate.getTime() === today.getTime();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = attDate >= weekAgo;
    }

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-4 px-3 md:py-6 md:px-4">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold">Kehadiran Perlu Validasi</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Total {filteredAttendances.length} kehadiran menunggu konfirmasi
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NPM, atau mata kuliah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Tanggal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tanggal</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendances List */}
      {filteredAttendances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Semua Sudah Tervalidasi!</h3>
            <p className="text-muted-foreground text-center">
              Tidak ada kehadiran yang perlu dikonfirmasi saat ini
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredAttendances.map((attendance) => (
            <Card key={attendance.id}>
              <CardContent className="p-3 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Selfie Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(attendance.selfieImage)}
                      alt={attendance.studentName}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                      onClick={() => setSelectedImage(getImageUrl(attendance.selfieImage))}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base md:text-lg truncate">{attendance.studentName}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{attendance.studentNpm}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs ml-2 flex-shrink-0">
                        Pending
                      </Badge>
                    </div>

                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{attendance.schedule?.courseName}</span>
                        <span className="text-muted-foreground flex-shrink-0">({attendance.schedule?.courseCode})</span>
                      </div>
                      <div className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Scan: {new Date(attendance.scannedAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {' '}
                          pukul {new Date(attendance.scannedAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                          minute: '2-digit',
                        })}
                        </span>
                      </div>
                    </div>                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(attendance.id)}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        Konfirmasi
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(attendance.id)}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/schedules/${attendance.scheduleId}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Lihat Jadwal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
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
              <Button variant="destructive" onClick={submitReject}>Kirim Penolakan</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Selfie Preview"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
