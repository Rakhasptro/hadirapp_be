import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';

interface FormData {
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  topic: string;
}

export default function ScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    courseName: '',
    courseCode: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    topic: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchSchedule();
    }
  }, [id]);

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const schedule = response.data;
      setFormData({
        courseName: schedule.courseName,
        courseCode: schedule.courseCode,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room || '',
        topic: schedule.topic || '',
      });
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      const message = error.response?.data?.message || 'Gagal memuat data jadwal. Silakan coba lagi.';
      toast.error(message);
      navigate('/schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.courseName || !formData.courseCode || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Harap isi semua field yang wajib');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Waktu mulai harus lebih awal dari waktu selesai');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        room: formData.room || null,
        topic: formData.topic || null,
      };

      if (isEdit) {
        await axios.put(`/schedules/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Jadwal berhasil diperbarui');
      } else {
        await axios.post('/schedules', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Jadwal berhasil dibuat');
      }
      navigate('/schedules');
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      const message = error.response?.data?.message || 'Gagal menyimpan jadwal. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/schedules')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Perbarui informasi jadwal mengajar' : 'Buat jadwal mengajar baru'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Jadwal
            </CardTitle>
            <CardDescription>Isi formulir di bawah untuk membuat atau mengubah jadwal mengajar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nama Mata Kuliah */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Mata Kuliah <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Contoh: Pemrograman Web"
                value={formData.courseName}
                onChange={(e) => handleChange('courseName', e.target.value)}
                required
              />
            </div>

            {/* Kode Mata Kuliah */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kode Mata Kuliah <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Contoh: TI201"
                value={formData.courseCode}
                onChange={(e) => handleChange('courseCode', e.target.value)}
                required
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            {/* Waktu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Waktu Mulai <span className="text-destructive">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Waktu Selesai <span className="text-destructive">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Ruangan */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ruangan</label>
              <Input
                placeholder="Contoh: Lab 301, Kelas 12A, Ruang Multimedia"
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
              />
            </div>

            {/* Topik */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Topik Pembahasan</label>
              <Textarea
                placeholder="Contoh: Pengenalan React Hooks dan State Management"
                value={formData.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/schedules')}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Menyimpan...' : isEdit ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
