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
  name: string;
  grade: string;
  major: string;
  capacity: number;
}

export default function ClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    grade: '10',
    major: '',
    capacity: 40,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchClassData();
    }
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/classes/${id}`);
      const cls = response.data;
      
      setFormData({
        name: cls.name,
        grade: cls.grade,
        major: cls.major || '',
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
    if (!formData.name || !formData.grade) {
      toast({
        title: 'Error',
        description: 'Nama kelas dan tingkat harus diisi',
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
        name: formData.name,
        grade: formData.grade,
        major: formData.major || null,
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
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: X-IPA-1"
                  required
                />
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade">Tingkat *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Kelas 10</SelectItem>
                    <SelectItem value="11">Kelas 11</SelectItem>
                    <SelectItem value="12">Kelas 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label htmlFor="major">Jurusan</Label>
                <Select
                  value={formData.major || undefined}
                  onValueChange={(value) => setFormData({ ...formData, major: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jurusan (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IPA">IPA</SelectItem>
                    <SelectItem value="IPS">IPS</SelectItem>
                    <SelectItem value="Bahasa">Bahasa</SelectItem>
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
