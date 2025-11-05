import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import axios from '@/lib/axios';

interface FormData {
  courseId: string;
  classId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  wifiNetworkId: string;
  isActive: boolean;
}

const dayOfWeekOptions = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
  { value: 'WEDNESDAY', label: 'Rabu' },
  { value: 'THURSDAY', label: 'Kamis' },
  { value: 'FRIDAY', label: 'Jumat' },
  { value: 'SATURDAY', label: 'Sabtu' },
  { value: 'SUNDAY', label: 'Minggu' },
];

export default function ScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    courseId: '',
    classId: '',
    teacherId: '',
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    room: '',
    wifiNetworkId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFormOptions();
    if (isEdit) {
      fetchSchedule();
    }
  }, [id]);

  const fetchFormOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const [coursesRes, classesRes, teachersRes, wifiRes] = await Promise.all([
        axios.get('/admin/courses/list', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/classes/list', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/teachers/list', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/wifi/list', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCourses(coursesRes.data);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      setWifiNetworks(wifiRes.data);
    } catch (error) {
      console.error('Error fetching form options:', error);
      alert('Gagal memuat data form');
    }
  };

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const schedule = response.data;
      setFormData({
        courseId: schedule.courseId,
        classId: schedule.classId,
        teacherId: schedule.teacherId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room || '',
        wifiNetworkId: schedule.wifiNetworkId || '',
        isActive: schedule.isActive,
      });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.courseId || !formData.classId || !formData.teacherId || !formData.startTime || !formData.endTime) {
      alert('Harap isi semua field yang wajib');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert('Waktu mulai harus lebih awal dari waktu selesai');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        wifiNetworkId: formData.wifiNetworkId || null,
        room: formData.room || null,
      };

      if (isEdit) {
        await axios.put(`/admin/schedules/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Jadwal berhasil diperbarui');
      } else {
        await axios.post('/admin/schedules', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Jadwal berhasil dibuat');
      }
      navigate('/schedules');
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
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
            {isEdit ? 'Perbarui informasi jadwal' : 'Buat jadwal pelajaran baru'}
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
            <CardDescription>Isi formulir di bawah untuk membuat atau mengubah jadwal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mata Pelajaran */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mata Pelajaran <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                required
              >
                <option value="">Pilih Mata Pelajaran</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kelas <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.classId}
                onChange={(e) => handleChange('classId', e.target.value)}
                required
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.major ? `- ${cls.major}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Guru */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Guru Pengajar <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.teacherId}
                onChange={(e) => handleChange('teacherId', e.target.value)}
                required
              >
                <option value="">Pilih Guru</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.nip})
                  </option>
                ))}
              </select>
            </div>

            {/* Hari */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Hari <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.dayOfWeek}
                onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                required
              >
                {dayOfWeekOptions.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
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

            {/* WiFi Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Jaringan WiFi</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.wifiNetworkId}
                onChange={(e) => handleChange('wifiNetworkId', e.target.value)}
              >
                <option value="">Tidak Ada</option>
                {wifiNetworks.map((wifi) => (
                  <option key={wifi.id} value={wifi.id}>
                    {wifi.ssid}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Jadwal Aktif
              </label>
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
