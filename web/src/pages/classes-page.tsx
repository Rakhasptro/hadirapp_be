import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios';

interface Class {
  id: string;
  name: string;
  semester: string;
  courseId: string | null;
  capacity: number;
  courses?: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  _count: {
      students: number;
      schedules: number;
  };
}

interface Stats {
  total: number;
  totalStudents: number;
  avgStudentsPerClass: number;
  bySemester: Record<string, number>;
  byCourse: Record<string, number>;
}

export default function ClassesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('');
  const [courseIdFilter, setCourseIdFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchStats();
  }, [semesterFilter, courseIdFilter]);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/admin/courses/list');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (semesterFilter) params.append('semester', semesterFilter);
      if (courseIdFilter) params.append('courseId', courseIdFilter);
      
      const response = await apiClient.get(`/admin/classes?${params}`);
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data kelas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/classes/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;

    try {
      await apiClient.delete(`/admin/classes/${classToDelete.id}`);
      toast({
        title: 'Berhasil',
        description: 'Kelas berhasil dihapus',
      });
      fetchClasses();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus kelas',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const openDeleteDialog = (cls: Class) => {
    setClassToDelete(cls);
    setDeleteDialogOpen(true);
  };

  const filteredClasses = classes.filter((cls) => {
    const matchSearch = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.courses?.name && cls.courses.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchSearch;
  });

  const getUtilization = (studentCount: number, capacity: number) => {
    if (!capacity) return 0;
    return Math.round((studentCount / capacity) * 100);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kelas</h1>
          <p className="text-muted-foreground">
            Kelola data kelas dan kapasitas siswa
          </p>
        </div>
        <Button onClick={() => navigate('/classes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata per Kelas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgStudentsPerClass}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Semester</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {Object.entries(stats.bySemester).map(([semester, count]) => (
                  <div key={semester} className="flex justify-between">
                    <span>Semester {semester}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Semester</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
                <SelectItem value="5">Semester 5</SelectItem>
                <SelectItem value="6">Semester 6</SelectItem>
                <SelectItem value="7">Semester 7</SelectItem>
                <SelectItem value="8">Semester 8</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseIdFilter} onValueChange={setCourseIdFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kelas</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Mata Kuliah</TableHead>
                    <TableHead className="text-center">Siswa</TableHead>
                    <TableHead className="text-center">Kapasitas</TableHead>
                    <TableHead className="text-center">Utilisasi</TableHead>
                    <TableHead className="text-center">Jadwal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Tidak ada data kelas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClasses.map((cls) => {
                      const utilization = getUtilization(cls._count.students, cls.capacity);
                      return (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Semester {cls.semester}</Badge>
                          </TableCell>
                          <TableCell>
                            {cls.courses ? (
                              <div>
                                <div className="font-medium">{cls.courses.name}</div>
                                <div className="text-sm text-muted-foreground">{cls.courses.code}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {cls._count.students}
                          </TableCell>
                          <TableCell className="text-center">
                            {cls.capacity}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${getUtilizationColor(utilization)}`}>
                              {utilization}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {cls._count.schedules}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/classes/edit/${cls.id}`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(cls)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{classToDelete?.name}</strong>?
              <br />
              <br />
              {classToDelete && classToDelete._count.students > 0 && (
                <span className="text-red-600 font-semibold">
                  ⚠️ Kelas ini memiliki {classToDelete._count.students} siswa dan tidak dapat dihapus!
                </span>
              )}
              {classToDelete && classToDelete._count.schedules > 0 && (
                <span className="text-red-600 font-semibold">
                  ⚠️ Kelas ini memiliki {classToDelete._count.schedules} jadwal dan tidak dapat dihapus!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                classToDelete
                  ? classToDelete._count.students > 0 || classToDelete._count.schedules > 0
                  : false
              }
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
