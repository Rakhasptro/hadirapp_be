import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Calendar, Clock, MapPin, BookOpen, Edit, Trash2, QrCode, Download, X, Lock } from 'lucide-react';
import axios from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string | null;
  topic: string | null;
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED';
  qrCodeImage: string | null; // base64 PNG
}

export default function SchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Schedule | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [scheduleToClose, setScheduleToClose] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Jadwal berhasil dihapus');
      fetchSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      const message = error.response?.data?.message || 'Gagal menghapus jadwal. Silakan coba lagi.';
      toast.error(message);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/schedules/${id}/status`, 
        { status: 'ACTIVE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Jadwal berhasil diaktifkan. QR code sekarang dapat digunakan.');
      fetchSchedules();
    } catch (error: any) {
      console.error('Error activating schedule:', error);
      const message = error.response?.data?.message || 'Gagal mengaktifkan jadwal. Silakan coba lagi.';
      toast.error(message);
    }
  };

  const handleClose = async (id: string) => {
    setScheduleToClose(id);
    setCloseDialogOpen(true);
  };

  const confirmClose = async () => {
    if (!scheduleToClose) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/schedules/${scheduleToClose}/status`, 
        { status: 'CLOSED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Jadwal berhasil ditutup. QR code dinonaktifkan.');
      fetchSchedules();
    } catch (error: any) {
      console.error('Error closing schedule:', error);
      const message = error.response?.data?.message || 'Gagal menutup jadwal. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setCloseDialogOpen(false);
      setScheduleToClose(null);
    }
  };

  const handleShowQR = (schedule: Schedule) => {
    setSelectedQR(schedule);
    setQrDialogOpen(true);
  };

  const handleDownloadQR = () => {
    if (!selectedQR?.qrCodeImage) return;
    
    const link = document.createElement('a');
    link.href = selectedQR.qrCodeImage;
    link.download = `QR_${selectedQR.courseCode}_${selectedQR.date}.png`;
    link.click();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedSchedules).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Mengajar</h1>
          <p className="text-muted-foreground mt-1">Kelola jadwal dan QR Code kehadiran</p>
        </div>
        <Button onClick={() => navigate('/schedules/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                <QrCode className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jadwal Aktif</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules by Date */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada jadwal</h3>
            <p className="text-muted-foreground mb-4">
              Mulai dengan menambahkan jadwal mengajar baru
            </p>
            <Button onClick={() => navigate('/schedules/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jadwal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(date)}
                </CardTitle>
                <CardDescription>{groupedSchedules[date].length} jadwal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedSchedules[date]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                              </div>
                              {schedule.status === 'ACTIVE' ? (
                                <Badge variant="default" className="bg-green-500">Aktif</Badge>
                              ) : schedule.status === 'CLOSED' ? (
                                <Badge variant="destructive">Ditutup</Badge>
                              ) : (
                                <Badge variant="secondary">Terjadwal</Badge>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-semibold text-lg">
                                {schedule.courseName} 
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({schedule.courseCode})
                                </span>
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                {schedule.topic && (
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{schedule.topic}</span>
                                  </div>
                                )}
                                {schedule.room && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{schedule.room}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {/* Toggle between Active and Closed */}
                            {(schedule.status === 'SCHEDULED' || schedule.status === 'CLOSED') && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActivate(schedule.id)}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <QrCode className="h-4 w-4" />
                                Aktifkan
                              </Button>
                            )}
                            {schedule.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClose(schedule.id)}
                                className="gap-2 text-orange-600 hover:text-orange-700 border-orange-600"
                              >
                                <Lock className="h-4 w-4" />
                                Tutup
                              </Button>
                            )}
                            {schedule.qrCodeImage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowQR(schedule)}
                                className="gap-2"
                              >
                                <QrCode className="h-4 w-4" />
                                Lihat QR
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/schedules/edit/${schedule.id}`)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(schedule.id)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal (Simple) */}
      {qrDialogOpen && selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setQrDialogOpen(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>QR Code Kehadiran</CardTitle>
                  <CardDescription>
                    {selectedQR.courseName} - {selectedQR.courseCode}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQrDialogOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {selectedQR.qrCodeImage && (
                  <img 
                    src={selectedQR.qrCodeImage} 
                    alt="QR Code" 
                    className="w-64 h-64 border rounded-lg"
                  />
                )}
                <div className="text-center text-sm text-muted-foreground">
                  <p>{formatDate(selectedQR.date)}</p>
                  <p>{selectedQR.startTime} - {selectedQR.endTime}</p>
                  {selectedQR.room && <p>Ruang: {selectedQR.room}</p>}
                </div>
                <Button onClick={handleDownloadQR} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Close Schedule Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup Jadwal Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              QR code akan dinonaktifkan sementara. Anda bisa mengaktifkannya kembali nanti jika diperlukan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScheduleToClose(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-orange-600 hover:bg-orange-700">
              Ya, Tutup Jadwal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
