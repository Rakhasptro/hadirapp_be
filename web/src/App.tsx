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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ChevronRight,
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
  Calendar,
  FileText,
  BellRing,
  Wifi,
  UserCog
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TeacherStatsCards } from "@/components/dashboard/teacher-stats-cards"
import { AttendanceStats } from "@/components/dashboard/attendance-stats"
import { ActiveSessions } from "@/components/dashboard/active-sessions"
import { RecentNotifications } from "@/components/dashboard/recent-notifications"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { MySchedule } from "@/components/dashboard/my-schedule"
import { authService } from "@/lib/auth"

function App() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    return user.email.substring(0, 2).toUpperCase()
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
                    <SidebarMenuButton tooltip="Dashboard">
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Attendance">
                      <CalendarCheck className="size-4" />
                      <span>Kehadiran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Schedules">
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
                    <SidebarMenuButton tooltip="Users">
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
                    <SidebarMenuButton tooltip="Classes">
                      <BookOpen className="size-4" />
                      <span>Kelas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Courses">
                      <BookOpen className="size-4" />
                      <span>Mata Pelajaran</span>
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
                    <SidebarMenuButton tooltip="Dashboard">
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
                    <SidebarMenuButton tooltip="Profile">
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
                      <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.role || 'User'}</span>
                      <span className="truncate text-xs">{user?.email || 'user@example.com'}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >

                  <DropdownMenuItem className="gap-2">
                    <User className="size-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Bell className="size-4" />
                    <span>Notifikasi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="size-4" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    <span>Log out</span>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="size-4" />
            <span>Overview</span>
          </div>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Stats Cards - Different for Admin and Teacher */}
          {isAdmin && <StatsCards />}
          {isTeacher && <TeacherStatsCards />}
          
          {/* Main Content Grid - Different layout for Admin and Teacher */}
          {isAdmin && (
            <>
              {/* Admin View: Attendance Chart + Stats */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* Attendance Chart - Takes 4 columns on large screens */}
                <div className="lg:col-span-4 order-2 lg:order-1">
                  <AttendanceChart />
                </div>
                
                {/* Attendance Stats - Takes 3 columns on large screens */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <AttendanceStats />
                </div>
              </div>
              
              {/* Bottom Grid */}
              <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
                {/* Active Sessions */}
                <ActiveSessions />
                
                {/* Recent Notifications */}
                <RecentNotifications />
              </div>
            </>
          )}
          
          {isTeacher && (
            <>
              {/* Teacher View: My Schedule + Active Sessions */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* My Schedule - Takes 4 columns */}
                <div className="lg:col-span-4">
                  <MySchedule />
                </div>
                
                {/* Active Sessions - Takes 3 columns */}
                <div className="lg:col-span-3">
                  <ActiveSessions />
                </div>
              </div>
              
              {/* Bottom: Notifications */}
              <RecentNotifications />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
