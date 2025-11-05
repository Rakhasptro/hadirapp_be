import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MapPin, Users, BookOpen, Filter, Search, Edit, Trash2, Wifi } from 'lucide-react';
import axios from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  isActive: boolean;
  courses: {
    id: string;
    name: string;
    code: string;
  };
  teachers: {
    id: string;
    name: string;
    nip: string;
  };
  classes: {
    id: string;
    name: string;
    grade: string;
    major: string | null;
  };
  wifi_networks: {
    id: string;
    ssid: string;
  } | null;
}

const dayOfWeekMap: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};

const dayOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export default function SchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/classes/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/admin/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Jadwal berhasil dihapus');
      fetchSchedules();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus jadwal');
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.courses.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.teachers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.classes.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = !selectedDay || schedule.dayOfWeek === selectedDay;
    const matchesClass = !selectedClass || schedule.classes.id === selectedClass;
    return matchesSearch && matchesDay && matchesClass;
  });

  // Group schedules by day
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort days and schedules
  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => dayOrder[a] - dayOrder[b]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Pelajaran</h1>
          <p className="text-muted-foreground mt-1">Kelola jadwal pelajaran sekolah</p>
        </div>
        <Button onClick={() => navigate('/schedules/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari mata pelajaran, guru, kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hari</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="">Semua Hari</option>
                {Object.entries(dayOfWeekMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kelas</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.major ? `- ${cls.major}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
                <p className="text-2xl font-bold">{filteredSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredSchedules.map((s) => s.courses.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelas</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredSchedules.map((s) => s.classes.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules by Day */}
      {sortedDays.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada jadwal ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedDay || selectedClass
                ? 'Coba ubah filter pencarian Anda'
                : 'Mulai dengan menambahkan jadwal baru'}
            </p>
            {!searchTerm && !selectedDay && !selectedClass && (
              <Button onClick={() => navigate('/schedules/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jadwal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => (
            <Card key={day}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {dayOfWeekMap[day]}
                </CardTitle>
                <CardDescription>{groupedSchedules[day].length} jadwal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedSchedules[day]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                              </div>
                              {!schedule.isActive && (
                                <Badge variant="secondary">Nonaktif</Badge>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-semibold text-lg">{schedule.courses.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{schedule.classes.name}</span>
                                  {schedule.classes.major && (
                                    <span className="text-xs">({schedule.classes.major})</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  <span>{schedule.teachers.name}</span>
                                </div>
                                {schedule.room && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{schedule.room}</span>
                                  </div>
                                )}
                                {schedule.wifi_networks && (
                                  <div className="flex items-center gap-1">
                                    <Wifi className="h-3.5 w-3.5" />
                                    <span>{schedule.wifi_networks.ssid}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/schedules/edit/${schedule.id}`)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(schedule.id)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
