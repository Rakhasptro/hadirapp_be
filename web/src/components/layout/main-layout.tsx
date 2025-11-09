import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronsUpDown,
  User,
  Bell,
  LogOut,
  Settings,
  LayoutDashboard,
  CalendarCheck,
  Users,
  GraduationCap,
  BookOpen,
  Library,
  Calendar,
  FileText,
  BellRing,
  Wifi,
  UserCog
} from "lucide-react"
import { useNavigate, Outlet } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { authService } from "@/lib/auth"
import { useState, useEffect } from "react"
import axios from "@/lib/axios"

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

interface UserProfile {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  profile: TeacherProfile | any
}

export function MainLayout() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/profile')
      setUserProfile(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null
    if (photo.startsWith('http')) return photo
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const apiBaseURL = baseURL.replace('/api', '')
    return `${apiBaseURL}${photo}`
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    if (userProfile?.role === 'TEACHER' && userProfile?.profile?.name) {
      return userProfile.profile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  const getDisplayName = () => {
    if (userProfile?.role === 'TEACHER' && userProfile?.profile?.name) {
      return userProfile.profile.name
    }
    return user?.email || 'User'
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <GraduationCap className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">HadirApp</span>
                      <span className="truncate text-xs">{user?.role || 'User'}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <GraduationCap className="size-4 shrink-0" />
                    </div>
                    HadirApp - Sistem Kehadiran
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          {/* ADMIN Menu */}
          {isAdmin && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Dashboard" onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Attendance" onClick={() => navigate('/attendance/sessions')}>
                      <CalendarCheck className="size-4" />
                      <span>Kehadiran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Schedules" onClick={() => navigate('/schedules')}>
                      <Calendar className="size-4" />
                      <span>Jadwal</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Leave">
                      <FileText className="size-4" />
                      <span>Izin/Cuti</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Notifications">
                      <BellRing className="size-4" />
                      <span>Notifikasi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Users" onClick={() => navigate('/users')}>
                      <Users className="size-4" />
                      <span>Pengguna</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Teachers">
                      <GraduationCap className="size-4" />
                      <span>Guru</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Classes" onClick={() => navigate('/classes')}>
                      <BookOpen className="size-4" />
                      <span>Kelas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Courses" onClick={() => navigate('/courses')}>
                      <Library className="size-4" />
                      <span>Mata Kuliah</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Sistem</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="WiFi Management">
                      <Wifi className="size-4" />
                      <span>WiFi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Admin">
                      <UserCog className="size-4" />
                      <span>Admin</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings className="size-4" />
                      <span>Pengaturan</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </>
          )}

          {/* TEACHER Menu */}
          {isTeacher && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Dashboard" onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="My Schedule">
                      <Calendar className="size-4" />
                      <span>Jadwal Mengajar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="My Classes">
                      <BookOpen className="size-4" />
                      <span>Kelas Saya</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Attendance">
                      <CalendarCheck className="size-4" />
                      <span>Kehadiran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Lainnya</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Leave Requests">
                      <FileText className="size-4" />
                      <span>Izin Siswa</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Notifications">
                      <BellRing className="size-4" />
                      <span>Notifikasi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Profile" onClick={() => navigate('/profile')}>
                      <User className="size-4" />
                      <span>Profil Saya</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      {userProfile?.role === 'TEACHER' && userProfile?.profile?.photo ? (
                        <AvatarImage 
                          src={getPhotoUrl(userProfile.profile.photo) || undefined} 
                          alt={userProfile.profile.name} 
                        />
                      ) : null}
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{getDisplayName()}</span>
                      <span className="truncate text-xs">{user?.role}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
