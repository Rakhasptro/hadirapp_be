import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, QrCode, Loader2 } from 'lucide-react';
import { scheduleService, CreateScheduleDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateScheduleDto>({
    courseName: '',
    courseCode: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    topic: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.courseName || !formData.courseCode || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Mohon lengkapi semua field yang wajib diisi',
      });
      return;
    }

    setLoading(true);
    try {
      const schedule = await scheduleService.createSchedule(formData);
      
      toast({
        title: 'Berhasil!',
        description: 'Jadwal berhasil dibuat dengan QR Code',
      });
      
      // Redirect to schedule detail to show QR code
      navigate(`/schedules/${schedule.id}`);
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal membuat jadwal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/schedules')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Buat Jadwal Baru</h1>
            <p className="text-muted-foreground">
              Isi formulir untuk membuat jadwal dan generate QR Code
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Jadwal</CardTitle>
            <CardDescription>
              Masukkan detail jadwal perkuliahan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Name */}
            <div className="space-y-2">
              <Label htmlFor="courseName">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="Contoh: Pemrograman Web"
                required
              />
            </div>

            {/* Course Code */}
            <div className="space-y-2">
              <Label htmlFor="courseCode">
                Kode Mata Kuliah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="Contoh: IF301"
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Jam Mulai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  Jam Selesai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label htmlFor="room">Ruangan</Label>
              <Input
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="Contoh: Lab 301"
              />
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Materi / Topik</Label>
              <Textarea
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Contoh: Pengenalan React.js dan Hooks"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/schedules')}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan & Generate QR
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
