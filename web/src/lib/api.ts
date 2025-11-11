import axios from './axios';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface Schedule {
  id: string;
  teacherId: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  topic: string;
  qrCode: string;
  qrCodeImage: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    nip: string;
  };
}

export interface CreateScheduleDto {
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  topic: string;
}

export interface Attendance {
  id: string;
  scheduleId: string;
  studentName: string;
  studentNpm: string;
  selfieImage: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  scannedAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  schedule?: Schedule;
}

export interface SubmitAttendanceDto {
  scheduleId: string;
  studentName: string;
  studentNpm: string;
  selfie: File;
}

// ========================================
// SCHEDULE SERVICE
// ========================================

export const scheduleService = {
  /**
   * Create new schedule with QR code
   * POST /api/schedules
   */
  async createSchedule(data: CreateScheduleDto): Promise<Schedule> {
    const response = await axios.post<Schedule>('/schedules', data);
    return response.data;
  },

  /**
   * Get all schedules for logged-in teacher
   * GET /api/schedules
   */
  async getMySchedules(): Promise<Schedule[]> {
    const response = await axios.get<Schedule[]>('/schedules');
    return response.data;
  },

  /**
   * Get schedule by ID
   * GET /api/schedules/:id
   */
  async getScheduleById(id: string): Promise<Schedule> {
    const response = await axios.get<Schedule>(`/schedules/${id}`);
    return response.data;
  },

  /**
   * Update schedule
   * PATCH /api/schedules/:id
   */
  async updateSchedule(id: string, data: Partial<CreateScheduleDto>): Promise<Schedule> {
    const response = await axios.patch<Schedule>(`/schedules/${id}`, data);
    return response.data;
  },

  /**
   * Delete schedule
   * DELETE /api/schedules/:id
   */
  async deleteSchedule(id: string): Promise<void> {
    await axios.delete(`/schedules/${id}`);
  },

  /**
   * Verify QR code (public endpoint, no auth required)
   * GET /api/public/schedules/verify/:qrCode
   */
  async verifyQRCode(qrCode: string): Promise<Schedule> {
    const response = await axios.get<Schedule>(`/public/schedules/verify/${qrCode}`);
    return response.data;
  },

  /**
   * Complete/Close schedule
   * PATCH /api/schedules/:id/complete
   */
  async completeSchedule(id: string): Promise<Schedule> {
    const response = await axios.patch<Schedule>(`/schedules/${id}/complete`);
    return response.data;
  },
};

// ========================================
// ATTENDANCE SERVICE
// ========================================

export const attendanceService = {
  /**
   * Submit attendance (from mobile app)
   * POST /api/attendance/submit
   */
  async submitAttendance(data: SubmitAttendanceDto): Promise<Attendance> {
    const formData = new FormData();
    formData.append('scheduleId', data.scheduleId);
    formData.append('studentName', data.studentName);
    formData.append('studentNpm', data.studentNpm);
    formData.append('selfie', data.selfie);

    const response = await axios.post<Attendance>('/attendance/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all pending attendances for teacher
   * GET /api/attendance/pending
   */
  async getPendingAttendances(): Promise<Attendance[]> {
    const response = await axios.get<Attendance[]>('/attendance/pending');
    return response.data;
  },

  /**
   * Get attendances for specific schedule
   * GET /api/attendance/schedule/:scheduleId
   */
  async getScheduleAttendances(scheduleId: string): Promise<Attendance[]> {
    const response = await axios.get<Attendance[]>(`/attendance/schedule/${scheduleId}`);
    return response.data;
  },

  /**
   * Confirm attendance
   * PATCH /api/attendance/:id/confirm
   */
  async confirmAttendance(id: string): Promise<Attendance> {
    const response = await axios.patch<Attendance>(`/attendance/${id}/confirm`);
    return response.data;
  },

  /**
   * Reject attendance
   * PATCH /api/attendance/:id/reject
   */
  async rejectAttendance(id: string, reason: string): Promise<Attendance> {
    const response = await axios.patch<Attendance>(`/attendance/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Get attendance statistics for teacher
   * GET /api/attendance/statistics
   */
  async getAttendanceStatistics(): Promise<{
    totalSchedules: number;
    totalAttendances: number;
    pendingCount: number;
    confirmedCount: number;
    rejectedCount: number;
  }> {
    const response = await axios.get('/attendance/statistics');
    return response.data;
  },

  /**
   * Export attendance to CSV
   * GET /api/attendance/export/csv/:scheduleId
   */
  async exportToCSV(scheduleId: string): Promise<Blob> {
    const response = await axios.get(`/attendance/export/csv/${scheduleId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export attendance to Excel
   * GET /api/attendance/export/excel/:scheduleId
   */
  async exportToExcel(scheduleId: string): Promise<Blob> {
    const response = await axios.get(`/attendance/export/excel/${scheduleId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download export file helper
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

// ========================================
// TEACHER SERVICE
// ========================================

export interface Teacher {
  id: string;
  userId: string;
  nip: string;
  name: string;
  phone?: string;
  email?: string;
}

export const teacherService = {
  /**
   * Get teacher profile
   * GET /api/teachers/profile
   */
  async getProfile(): Promise<Teacher> {
    const response = await axios.get<Teacher>('/teachers/profile');
    return response.data;
  },

  /**
   * Update teacher profile
   * PATCH /api/teachers/profile
   */
  async updateProfile(data: Partial<Teacher>): Promise<Teacher> {
    const response = await axios.patch<Teacher>('/teachers/profile', data);
    return response.data;
  },

  /**
   * Get teacher dashboard statistics
   * GET /api/teachers/dashboard
   */
  async getDashboardStats(): Promise<{
    totalSchedules: number;
    todaySchedules: number;
    totalAttendances: number;
    pendingAttendances: number;
  }> {
    const response = await axios.get('/teachers/dashboard');
    return response.data;
  },
};
