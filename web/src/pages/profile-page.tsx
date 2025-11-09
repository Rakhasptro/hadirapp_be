import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Loader2, Save, X, User, Phone, MapPin, IdCard, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TeacherProfile {
  id: string
  name: string
  nip: string
  email: string | null
  gender: string | null
  phone: string | null
  address: string | null
  photo: string | null
}

interface ProfileData {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  profile: TeacherProfile | any
}

export function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nip: '',
    teacherEmail: '',
    gender: '',
    phone: '',
    address: '',
    photo: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null
    if (photo.startsWith('http')) return photo
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const apiBaseURL = baseURL.replace('/api', '')
    return `${apiBaseURL}${photo}`
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/profile')
      const userData = response.data.user
      setProfile(userData)

      // Initialize form data
      if (userData.role === 'TEACHER' && userData.profile) {
        setFormData({
          email: userData.email || '',
          name: userData.profile.name || '',
          nip: userData.profile.nip || '',
          teacherEmail: userData.profile.email || '',
          gender: userData.profile.gender || '',
          phone: userData.profile.phone || '',
          address: userData.profile.address || '',
          photo: userData.profile.photo || '',
        })
      } else {
        setFormData({
          email: userData.email || '',
          name: '',
          nip: '',
          teacherEmail: '',
          gender: '',
          phone: '',
          address: '',
          photo: '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data profil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'File harus berupa gambar',
          variant: 'destructive',
        })
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Ukuran file maksimal 2MB',
          variant: 'destructive',
        })
        return
      }

      setPhotoFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
    setFormData({ ...formData, photo: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Upload photo first if teacher has selected a photo
      let photoUrl = formData.photo
      if (profile?.role === 'TEACHER' && photoFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('photo', photoFile)
        
        try {
          const uploadResponse = await axios.post('/upload/photo', formDataUpload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          photoUrl = uploadResponse.data.url
        } catch (uploadError: any) {
          toast({
            title: 'Error',
            description: uploadError.response?.data?.message || 'Gagal mengupload foto',
            variant: 'destructive',
          })
          return
        }
      }
      
      const updateData: any = {
        email: formData.email,
      }

      if (profile?.role === 'TEACHER') {
        updateData.name = formData.name
        updateData.nip = formData.nip
        updateData.email = formData.teacherEmail
        updateData.gender = formData.gender
        updateData.phone = formData.phone
        updateData.address = formData.address
        updateData.photo = photoUrl
      }

      await axios.put('/profile', updateData)
      
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      })

      // Refresh profile data
      await fetchProfile()
      
      // Trigger profile update event for sidebar
      window.dispatchEvent(new Event('profileUpdated'))
      
      // Clear photo upload state
      setPhotoFile(null)
      setPhotoPreview('')
      setEditing(false)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memperbarui profil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original
    if (profile) {
      if (profile.role === 'TEACHER' && profile.profile) {
        setFormData({
          email: profile.email || '',
          name: profile.profile.name || '',
          nip: profile.profile.nip || '',
          teacherEmail: profile.profile.email || '',
          gender: profile.profile.gender || '',
          phone: profile.profile.phone || '',
          address: profile.profile.address || '',
          photo: profile.profile.photo || '',
        })
      } else {
        setFormData({
          email: profile.email || '',
          name: '',
          nip: '',
          teacherEmail: '',
          gender: '',
          phone: '',
          address: '',
          photo: '',
        })
      }
    }
    setPhotoFile(null)
    setPhotoPreview('')
    setEditing(false)
  }

  const getInitials = () => {
    if (profile?.role === 'TEACHER' && profile.profile?.name) {
      return profile.profile.name.substring(0, 2).toUpperCase()
    }
    if (!profile?.email) return 'U'
    return profile.email.substring(0, 2).toUpperCase()
  }

  const getGenderLabel = (gender: string | null) => {
    if (gender === 'L') return 'Laki-laki'
    if (gender === 'P') return 'Perempuan'
    return '-'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500 hover:bg-red-600'
      case 'TEACHER':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'STUDENT':
        return 'bg-green-500 hover:bg-green-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'TEACHER':
        return 'Guru'
      case 'STUDENT':
        return 'Mahasiswa'
      default:
        return role
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Gagal memuat data profil</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {profile.role === 'TEACHER' && profile.profile?.photo ? (
                  <AvatarImage 
                    src={getPhotoUrl(profile.profile.photo) || undefined} 
                    alt={profile.profile.name} 
                  />
                ) : null}
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile.role === 'TEACHER' && profile.profile?.name 
                    ? profile.profile.name 
                    : profile.email}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                  {profile.role === 'TEACHER' && profile.profile?.nip && (
                    <span className="text-sm text-muted-foreground">NIP: {profile.profile.nip}</span>
                  )}
                </CardDescription>
              </div>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Profil</Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {editing ? (
            // Edit Mode
            <>
              <div className="space-y-4">
                {/* Email Login */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Login
                    </div>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email digunakan untuk login ke sistem
                  </p>
                </div>

                {profile.role === 'TEACHER' && (
                  <>
                    {/* Nama */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nama Lengkap *
                        </div>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nama lengkap"
                        required
                      />
                    </div>

                    {/* NIP */}
                    <div className="space-y-2">
                      <Label htmlFor="nip">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          NIP *
                        </div>
                      </Label>
                      <Input
                        id="nip"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        placeholder="Nomor Induk Pegawai"
                        required
                      />
                    </div>

                    {/* Email Personal */}
                    <div className="space-y-2">
                      <Label htmlFor="teacherEmail">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Personal
                        </div>
                      </Label>
                      <Input
                        id="teacherEmail"
                        name="teacherEmail"
                        type="email"
                        value={formData.teacherEmail}
                        onChange={handleInputChange}
                        placeholder="email.personal@example.com"
                      />
                    </div>

                    {/* Gender */}
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

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Telepon
                        </div>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Alamat
                        </div>
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Alamat lengkap"
                        rows={3}
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="photo">Foto Profil</Label>
                      <div className="flex items-start gap-4">
                        {(photoPreview || formData.photo) && (
                          <div className="relative">
                            <img
                              src={photoPreview || getPhotoUrl(formData.photo) || ''}
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
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            // View Mode
            <div className="space-y-4">
              {/* Email Login */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Login</p>
                  <p className="text-base mt-1">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email ini digunakan untuk login ke sistem
                  </p>
                </div>
              </div>

              {profile.role === 'TEACHER' && profile.profile && (
                <>
                  {/* Nama */}
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                      <p className="text-base mt-1">{profile.profile.name}</p>
                    </div>
                  </div>

                  {/* NIP */}
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">NIP</p>
                      <p className="text-base mt-1">{profile.profile.nip}</p>
                    </div>
                  </div>

                  {/* Email Personal */}
                  {profile.profile.email && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Email Personal</p>
                        <p className="text-base mt-1">{profile.profile.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {profile.profile.gender && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                        <p className="text-base mt-1">{getGenderLabel(profile.profile.gender)}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {profile.profile.phone && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                        <p className="text-base mt-1">{profile.profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {profile.profile.address && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Alamat</p>
                        <p className="text-base mt-1 whitespace-pre-line">{profile.profile.address}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Role Info */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'ADMIN' && 'Anda memiliki akses penuh ke sistem sebagai Administrator'}
                  {profile.role === 'TEACHER' && 'Anda dapat mengelola kehadiran siswa dan melihat jadwal mengajar'}
                  {profile.role === 'STUDENT' && 'Anda dapat melihat kehadiran dan jadwal kelas'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
