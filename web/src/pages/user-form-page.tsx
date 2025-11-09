import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
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
  email: string;
  password?: string;
  role: string;
  name: string;
  nis?: string;
  nip?: string;
  classId?: string;
  phone?: string;
  address?: string;
  gender?: string;
  photo?: string;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'STUDENT',
    name: '',
    nis: '',
    nip: '',
    classId: '',
    phone: '',
    address: '',
    gender: '',
    photo: '',
  });

  useEffect(() => {
    fetchClasses();
    if (isEditMode) {
      fetchUserData();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get('/admin/classes/list');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/users/${id}`);
      const user = response.data;
      
      setFormData({
        email: user.email,
        role: user.role,
        name: user.students?.name || user.teachers?.name || '',
        nis: user.students?.nis || '',
        nip: user.teachers?.nip || '',
        classId: user.students?.classId || '',
        phone: user.students?.phone || user.teachers?.phone || '',
        address: user.students?.address || user.teachers?.address || '',
        gender: user.teachers?.gender || '',
        photo: user.teachers?.photo || '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data pengguna',
        variant: 'destructive',
      });
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'File harus berupa gambar',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Ukuran file maksimal 2MB',
          variant: 'destructive',
        });
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData({ ...formData, photo: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.role || !formData.name) {
      toast({
        title: 'Error',
        description: 'Email, role, dan nama harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      toast({
        title: 'Error',
        description: 'Password minimal 6 karakter',
        variant: 'destructive',
      });
      return;
    }

    if (formData.role === 'STUDENT' && !formData.nis) {
      toast({
        title: 'Error',
        description: 'NIS harus diisi untuk mahasiswa',
        variant: 'destructive',
      });
      return;
    }

    if (formData.role === 'TEACHER' && !formData.nip) {
      toast({
        title: 'Error',
        description: 'NIP harus diisi untuk guru',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload photo first if teacher has selected a photo
      let photoUrl = formData.photo;
      if (formData.role === 'TEACHER' && photoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('photo', photoFile);
        
        try {
          const uploadResponse = await apiClient.post('/upload/photo', formDataUpload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          photoUrl = uploadResponse.data.url;
        } catch (uploadError: any) {
          toast({
            title: 'Error',
            description: uploadError.response?.data?.message || 'Gagal mengupload foto',
            variant: 'destructive',
          });
          return;
        }
      }
      
      const payload: any = {
        email: formData.email,
        role: formData.role,
        name: formData.name,
        phone: formData.phone || null,
      };

      if (formData.role === 'STUDENT') {
        payload.nis = formData.nis;
        payload.classId = formData.classId || null;
        payload.address = formData.address || null;
      } else if (formData.role === 'TEACHER') {
        payload.nip = formData.nip;
        payload.gender = formData.gender || null;
        payload.address = formData.address || null;
        payload.photo = photoUrl || null;
      }

      if (!isEditMode) {
        payload.password = formData.password;
        await apiClient.post('/admin/users', payload);
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil dibuat',
        });
      } else {
        await apiClient.put(`/admin/users/${id}`, payload);
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil diperbarui',
        });
      }

      navigate('/users');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Perbarui data pengguna' : 'Buat pengguna baru'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Password */}
              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    required={!isEditMode}
                  />
                </div>
              )}

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Guru</SelectItem>
                    <SelectItem value="STUDENT">Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              {/* NIS (for students) */}
              {formData.role === 'STUDENT' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nis">NIS *</Label>
                    <Input
                      id="nis"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="Nomor Induk Mahasiswa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classId">Kelas</Label>
                    <Select
                      value={formData.classId || undefined}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas (opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* NIP (for teachers) */}
              {formData.role === 'TEACHER' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP *</Label>
                    <Input
                      id="nip"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="Nomor Induk Pegawai"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select
                      value={formData.gender || undefined}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="photo">Foto Profil</Label>
                    <div className="flex items-start gap-4">
                      {/* Preview Area */}
                      {(photoPreview || formData.photo) && (
                        <div className="relative">
                          <img
                            src={photoPreview || formData.photo}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={handleRemovePhoto}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <div className="flex-1">
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <Label
                          htmlFor="photo"
                          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <Upload className="h-5 w-5" />
                          <span className="text-sm">
                            {photoPreview || formData.photo ? 'Ganti Foto' : 'Upload Foto'}
                          </span>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-2">
                          Format: JPG, PNG, GIF. Maksimal 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Phone */}
              {formData.role !== 'ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              )}

              {/* Address (for students) */}
              {formData.role === 'STUDENT' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap"
                  />
                </div>
              )}

              {/* Address (for teachers) */}
              {formData.role === 'TEACHER' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
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
