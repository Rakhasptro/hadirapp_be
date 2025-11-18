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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Calendar,
  FileText,
  BellRing
} from "lucide-react"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { authService } from "@/lib/auth"
import { teacherService } from "@/lib/api"

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser()
  const isTeacher = user?.role === 'TEACHER'

  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const stats = await teacherService.getDashboardStats()
        setPendingCount(stats.pendingAttendances)
      } catch (error) {
        console.error('Failed to fetch pending count:', error)
      }
    }

    if (isTeacher) {
      fetchPendingCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isTeacher])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

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
              
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger>
                      Lainnya
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Leave Requests">
                            <FileText />
                            <span>Izin Siswa</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Notifications">
                            <BellRing />
                            <span>Notifikasi</span>
                            <Badge variant="destructive" className="ml-auto">2</Badge>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            tooltip="Profile" 
                            onClick={() => navigate('/profile')}
                            isActive={isActive('/profile')}
                          >
                            <User />
                            <span>Profil Saya</span>
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
