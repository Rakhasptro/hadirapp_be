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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Loader2, Save, X } from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state - only email
  const [formData, setFormData] = useState({
    email: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/profile')
      const userData = response.data.user
      setProfile(userData)

      // Initialize form data
      setFormData({
        email: userData.email || '',
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      alert('Gagal memuat data profil')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await axios.put('/profile', formData)
      
      alert('Profil berhasil diperbarui')

      // Refresh profile data
      await fetchProfile()
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original
    if (profile) {
      setFormData({
        email: profile.email || '',
      })
    }
    setEditing(false)
  }

  const getInitials = () => {
    if (!profile?.email) return 'U'
    return profile.email.substring(0, 2).toUpperCase()
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
        return 'Siswa'
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
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile.email}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">ID: {profile.id}</span>
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
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
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
              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base mt-1">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email ini digunakan untuk login ke sistem
                  </p>
                </div>
              </div>

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

              {/* User ID */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                <p className="text-sm font-mono bg-background px-2 py-1 rounded border inline-block">
                  {profile.id}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ID unik pengguna dalam sistem
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
