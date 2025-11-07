import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  code: string;
  name: string;
  description: string;
  teacherId: string;
  credits: number;
}

interface Teacher {
  id: string;
  name: string;
  nip: string;
}

export default function CourseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    teacherId: '',
    credits: 2,
  });

  useEffect(() => {
    fetchTeachers();
    if (isEditMode) {
      fetchCourseData();
    }
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/admin/teachers/list');
      setTeachers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data dosen',
        variant: 'destructive',
      });
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/${id}`);
      const course = response.data;

      setFormData({
        code: course.code,
        name: course.name,
        description: course.description || '',
        teacherId: course.teacherId,
        credits: course.credits,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data mata kuliah',
        variant: 'destructive',
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.name || !formData.teacherId) {
      toast({
        title: 'Error',
        description: 'Kode, nama, dan dosen pengampu harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (formData.credits < 1 || formData.credits > 10) {
      toast({
        title: 'Error',
        description: 'SKS harus antara 1-10',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        teacherId: formData.teacherId,
        credits: formData.credits,
      };

      if (!isEditMode) {
        await apiClient.post('/courses', payload);
        toast({
          title: 'Berhasil',
          description: 'Mata kuliah berhasil dibuat',
        });
      } else {
        await apiClient.put(`/courses/${id}`, payload);
        toast({
          title: 'Berhasil',
          description: 'Mata kuliah berhasil diperbarui',
        });
      }

      navigate('/courses');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Perbarui data mata kuliah' : 'Buat mata kuliah baru'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Mata Kuliah</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Kode Mata Kuliah *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: TIF101"
                  required
                  disabled={isEditMode}
                />
                {isEditMode && (
                  <p className="text-xs text-muted-foreground">
                    Kode mata kuliah tidak dapat diubah
                  </p>
                )}
              </div>

              {/* Credits */}
              <div className="space-y-2">
                <Label htmlFor="credits">SKS *</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })
                  }
                  placeholder="2"
                  min="1"
                  max="10"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nama Mata Kuliah *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pemrograman Web"
                  required
                />
              </div>

              {/* Teacher */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="teacherId">Dosen Pengampu *</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dosen pengampu" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.nip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi mata kuliah (opsional)"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/courses')}
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
