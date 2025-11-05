// Mock data untuk development dashboard

export interface SystemStats {
  students: number
  teachers: number
  classes: number
  admins: number
}

export interface AttendanceStats {
  present: number
  late: number
  absent: number
  total: number
}

export interface ActiveSession {
  id: string
  className: string
  subject: string
  teacher: string
  startTime: string
  endTime: string
  studentsPresent: number
  totalStudents: number
}

export interface Notification {
  id: string
  type: 'leave' | 'absent' | 'activity'
  title: string
  description: string
  time: string
  read: boolean
}

export interface ChartData {
  date: string
  present: number
  late: number
  absent: number
}

// System Statistics
export const systemStats: SystemStats = {
  students: 1248,
  teachers: 87,
  classes: 42,
  admins: 12,
}

// Today's Attendance Statistics
export const todayAttendance: AttendanceStats = {
  present: 1089,
  late: 87,
  absent: 72,
  total: 1248,
}

// Active Sessions
export const activeSessions: ActiveSession[] = [
  {
    id: '1',
    className: 'X IPA 1',
    subject: 'Matematika',
    teacher: 'Budi Santoso, S.Pd',
    startTime: '07:30',
    endTime: '09:00',
    studentsPresent: 28,
    totalStudents: 32,
  },
  {
    id: '2',
    className: 'XI IPS 2',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza, M.Pd',
    startTime: '09:15',
    endTime: '10:45',
    studentsPresent: 30,
    totalStudents: 30,
  },
  {
    id: '3',
    className: 'XII IPA 3',
    subject: 'Fisika',
    teacher: 'Ahmad Dahlan, S.Si',
    startTime: '10:45',
    endTime: '12:15',
    studentsPresent: 25,
    totalStudents: 28,
  },
]

// Recent Notifications
export const recentNotifications: Notification[] = [
  {
    id: '1',
    type: 'leave',
    title: 'Permohonan Izin',
    description: 'Andi Wijaya (X IPA 1) mengajukan izin sakit',
    time: '5 menit yang lalu',
    read: false,
  },
  {
    id: '2',
    type: 'absent',
    title: 'Ketidakhadiran',
    description: '3 siswa tidak hadir tanpa keterangan di kelas XI IPS 2',
    time: '15 menit yang lalu',
    read: false,
  },
  {
    id: '3',
    type: 'activity',
    title: 'Sesi Absensi Dimulai',
    description: 'Budi Santoso memulai sesi absensi untuk Matematika',
    time: '30 menit yang lalu',
    read: true,
  },
  {
    id: '4',
    type: 'leave',
    title: 'Permohonan Izin',
    description: 'Dewi Lestari (XII IPA 3) mengajukan izin keperluan keluarga',
    time: '1 jam yang lalu',
    read: true,
  },
  {
    id: '5',
    type: 'activity',
    title: 'Laporan Kehadiran',
    description: 'Laporan kehadiran harian telah dibuat',
    time: '2 jam yang lalu',
    read: true,
  },
]

// Weekly Attendance Chart Data
export const weeklyAttendanceData: ChartData[] = [
  { date: 'Sen', present: 1150, late: 65, absent: 33 },
  { date: 'Sel', present: 1180, late: 45, absent: 23 },
  { date: 'Rab', present: 1165, late: 58, absent: 25 },
  { date: 'Kam', present: 1190, late: 38, absent: 20 },
  { date: 'Jum', present: 1089, late: 87, absent: 72 },
]

// Monthly Attendance Chart Data
export const monthlyAttendanceData: ChartData[] = [
  { date: 'Minggu 1', present: 5680, late: 245, absent: 123 },
  { date: 'Minggu 2', present: 5720, late: 198, absent: 98 },
  { date: 'Minggu 3', present: 5695, late: 223, absent: 115 },
  { date: 'Minggu 4', present: 5750, late: 187, absent: 89 },
]
