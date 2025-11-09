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
  Calendar
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserProfile()
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
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
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Calendar className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HadirApp</span>
                  <span className="truncate text-xs">Sistem Kehadiran QR</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          {/* TEACHER Menu - New QR-based system */}
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
                <SidebarMenuButton tooltip="Schedules" onClick={() => navigate('/schedules')}>
                  <Calendar className="size-4" />
                  <span>Jadwal & QR Code</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Pending Attendances" onClick={() => navigate('/attendance/pending')}>
                  <CalendarCheck className="size-4" />
                  <span>Konfirmasi Kehadiran</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
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
