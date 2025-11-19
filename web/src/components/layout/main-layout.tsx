import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronRight,
  ChevronsUpDown,
  User,
  Bell,
  LogOut,
  Settings,
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  BookOpen,
  Calendar
} from "lucide-react"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { authService } from "@/lib/auth"
import { teacherService } from "@/lib/api"

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(authService.getUser())
  const isTeacher = user?.role === 'TEACHER'

  const [pendingCount, setPendingCount] = useState(0)

  // Listen for profile updates from the profile page. When received,
  // fetch the freshest user data from the API and update localStorage.
  useEffect(() => {
    const reloadUser = async () => {
      try {
        const fresh = await teacherService.getProfile()
        if (fresh) {
          setUser(fresh)
          localStorage.setItem('user', JSON.stringify(fresh))
        }
      } catch (error) {
        // keep console error for visibility when debugging
        console.error('Failed to reload user:', error)
      }
    }

    window.addEventListener('profileUpdated', reloadUser)
    return () => window.removeEventListener('profileUpdated', reloadUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null
    if (photo.startsWith('http')) return photo
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const apiBaseURL = baseURL.replace('/api', '')
    return `${apiBaseURL}${photo}`
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  // Fetch pending count for sidebar badge. Keep it lightweight.
  useEffect(() => {
    let mounted = true
    const fetchPending = async () => {
      try {
        const stats = await teacherService.getDashboardStats()
        if (mounted && stats && typeof stats.pendingAttendances === 'number') {
          setPendingCount(stats.pendingAttendances)
        }
      } catch {
        // ignore errors for badge
      }
    }

    if (isTeacher) {
      fetchPending()
      const id = setInterval(fetchPending, 30000)
      return () => {
        mounted = false
        clearInterval(id)
      }
    }
  }, [isTeacher])

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                asChild
              >
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">HadirApp</span>
                    <span className="truncate text-xs">{user?.role || 'User'}</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          {isTeacher && (
            <>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger>
                      Menu Utama
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            tooltip="Dashboard" 
                            onClick={() => navigate('/teacher/dashboard')}
                            isActive={isActive('/teacher/dashboard')}
                          >
                            <LayoutDashboard />
                            <span>Dashboard</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            tooltip="My Schedule" 
                            onClick={() => navigate('/schedules')}
                            isActive={isActive('/schedules')}
                          >
                            <Calendar />
                            <span>Jadwal Mengajar</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            tooltip="My Classes"
                            isActive={isActive('/classes')}
                          >
                            <BookOpen />
                            <span>Kelas Saya</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            tooltip="Attendance" 
                            onClick={() => navigate('/attendance/pending')}
                            isActive={isActive('/attendance')}
                          >
                            <CalendarCheck />
                            <span>Validasi Kehadiran</span>
                            {pendingCount > 0 && (
                              <Badge 
                                variant={pendingCount > 5 ? "destructive" : "secondary"} 
                                className={`ml-auto ${pendingCount > 10 ? 'animate-pulse' : ''}`}
                              >
                                {pendingCount}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
              
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
                      {user?.profile?.photo && <AvatarImage src={getPhotoUrl(user.profile.photo) || undefined} alt={user.email} />}
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.email}</span>
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
        <main className="flex-1 overflow-auto px-4 sm:px-8 lg:px-16">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
