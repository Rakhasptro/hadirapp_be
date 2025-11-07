import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios';

interface FormData {
  courseId: string;
  semester: string;
  capacity: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

export default function ClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<FormData>({
    courseId: '',
    semester: '1',
    capacity: 40,
  });

  useEffect(() => {
    fetchCourses();
    if (isEditMode) {
      fetchClassData();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/admin/courses/list');
      setCourses(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data mata kuliah',
        variant: 'destructive',
      });
    }
  };

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/classes/${id}`);
      const cls = response.data;
      
      setFormData({
        courseId: cls.courseId || '',
        semester: cls.semester,
        capacity: cls.capacity,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data kelas',
        variant: 'destructive',
      });
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.courseId || !formData.semester) {
      toast({
        title: 'Error',
        description: 'Mata kuliah dan semester harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      toast({
        title: 'Error',
        description: 'Kapasitas harus antara 1-100',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        courseId: formData.courseId,
        semester: formData.semester,
        capacity: formData.capacity,
      };

      if (!isEditMode) {
        await apiClient.post('/admin/classes', payload);
        toast({
          title: 'Berhasil',
          description: 'Kelas berhasil dibuat',
        });
      } else {
        await apiClient.put(`/admin/classes/${id}`, payload);
        toast({
          title: 'Berhasil',
          description: 'Kelas berhasil diperbarui',
        });
      }

      navigate('/classes');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menyimpan data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/classes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Kelas' : 'Tambah Kelas'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Perbarui data kelas' : 'Buat kelas baru'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Mata Kuliah */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseId">Mata Kuliah *</Label>
                <Select
                  value={formData.courseId || undefined}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Nama kelas akan otomatis menggunakan kode mata kuliah
                </p>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="40"
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/classes')}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
