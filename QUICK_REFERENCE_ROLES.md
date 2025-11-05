    # 🚀 Quick Reference: Role-Based Menu Implementation

## 📋 Implementation Summary

### **What Changed?**
Sidebar menu sekarang **dynamic** berdasarkan user role menggunakan conditional rendering.

### **Files Modified:**
- `web/src/App.tsx` - Added role-based sidebar rendering

---

## 🔑 Role Detection Code

```tsx
// Get current user
const user = authService.getUser()

// Role flags
const isAdmin = user?.role === 'ADMIN'
const isTeacher = user?.role === 'TEACHER'
const isStudent = user?.role === 'STUDENT' // Future
```

---

## 📊 Menu Mapping Quick Reference

| Menu Item | ADMIN | TEACHER | STUDENT* |
|-----------|-------|---------|----------|
| Dashboard | ✅ Global | ✅ Personal | ✅ Personal |
| Kehadiran | ✅ All | ✅ My Classes | ✅ My Attendance |
| Jadwal | ✅ All | ✅ My Schedule | ✅ Class Schedule |
| Jadwal Mengajar | ❌ | ✅ | ❌ |
| Kelas Saya | ❌ | ✅ | ❌ |
| Izin/Cuti | ✅ All | ✅ Student Leave | ✅ My Leave |
| Izin Siswa | ❌ | ✅ | ❌ |
| Notifikasi | ✅ Broadcast | ✅ Class | ✅ Personal |
| Pengguna | ✅ | ❌ | ❌ |
| Guru | ✅ | ❌ | ❌ |
| Kelas | ✅ | ❌ | ❌ |
| Mata Pelajaran | ✅ | ❌ | ❌ |
| WiFi | ✅ | ❌ | ❌ |
| Admin | ✅ | ❌ | ❌ |
| Pengaturan | ✅ | ❌ | ❌ |
| Profil Saya | ⚠️ (in Settings) | ✅ | ✅ |

*STUDENT = Coming Soon

---

## 🎯 Code Snippets

### **1. Admin Menu Block**

```tsx
{isAdmin && (
  <>
    <SidebarGroup>
      <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
      <SidebarMenu>
        {/* 5 menu items */}
      </SidebarMenu>
    </SidebarGroup>
    
    <SidebarGroup>
      <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
      <SidebarMenu>
        {/* 4 menu items */}
      </SidebarMenu>
    </SidebarGroup>
    
    <SidebarGroup>
      <SidebarGroupLabel>Sistem</SidebarGroupLabel>
      <SidebarMenu>
        {/* 3 menu items */}
      </SidebarMenu>
    </SidebarGroup>
  </>
)}
```

### **2. Teacher Menu Block**

```tsx
{isTeacher && (
  <>
    <SidebarGroup>
      <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
      <SidebarMenu>
        {/* 4 menu items */}
      </SidebarMenu>
    </SidebarGroup>
    
    <SidebarGroup>
      <SidebarGroupLabel>Lainnya</SidebarGroupLabel>
      <SidebarMenu>
        {/* 3 menu items */}
      </SidebarMenu>
    </SidebarGroup>
  </>
)}
```

### **3. Menu Item Template**

```tsx
<SidebarMenuItem>
  <SidebarMenuButton tooltip="Tooltip Text">
    <IconComponent className="size-4" />
    <span>Menu Label</span>
  </SidebarMenuButton>
</SidebarMenuItem>
```

---

## 🔐 Backend Protection Patterns

### **Admin-Only Controller**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  @Get('stats')
  async getStats() {
    // Only ADMIN can access
  }
}
```

### **Teacher-Only Endpoint**

```typescript
@Controller('teachers')
export class TeachersController {
  @Get('my-schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getMySchedule(@Request() req) {
    // Only TEACHER can access
    return this.teachersService.getMySchedule(req.user)
  }
}
```

### **Multi-Role with Filtering**

```typescript
@Controller('attendance')
export class AttendanceController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAttendance(@Request() req) {
    const { role, id } = req.user
    
    if (role === 'ADMIN') {
      // Return all attendance
      return this.attendanceService.findAll()
    } else if (role === 'TEACHER') {
      // Return teacher's classes attendance
      return this.attendanceService.findByTeacher(id)
    } else if (role === 'STUDENT') {
      // Return student's attendance
      return this.attendanceService.findByStudent(id)
    }
  }
}
```

---

## 📦 API Endpoints by Role

### **ADMIN Endpoints**

```typescript
GET    /admin/stats                     // Dashboard stats
GET    /admin/users                     // All users
GET    /admin/attendance/today-stats    // Today's attendance
GET    /admin/attendance/chart/weekly   // Weekly chart
GET    /admin/attendance/chart/monthly  // Monthly chart
GET    /users                           // CRUD users
GET    /teachers                        // CRUD teachers
GET    /classes                         // CRUD classes
GET    /courses                         // CRUD courses
GET    /wifi                            // CRUD WiFi networks
```

### **TEACHER Endpoints**

```typescript
GET    /teachers/dashboard              // Personal stats
GET    /teachers/my-schedule            // Teaching schedule
GET    /teachers/my-classes             // Classes taught
GET    /attendance?teacherId=:id        // Class attendance
GET    /schedules?teacherId=:id         // Teaching schedules
GET    /leave?teacherId=:id             // Student leave requests
GET    /profile                         // Own profile
```

### **Shared Endpoints (Filtered)**

```typescript
GET    /schedules/active                // Active sessions (role-filtered)
GET    /notifications                   // Notifications (role-filtered)
GET    /attendance                      // Attendance (role-filtered)
```

---

## 🎨 Icon Reference

```tsx
import {
  LayoutDashboard,  // Dashboard
  CalendarCheck,    // Kehadiran/Attendance
  Calendar,         // Jadwal/Schedule
  FileText,         // Izin/Leave
  BellRing,         // Notifikasi/Notifications
  Users,            // Pengguna/Users
  GraduationCap,    // Guru/Teachers
  BookOpen,         // Kelas/Classes & Mata Pelajaran/Courses
  Wifi,             // WiFi
  UserCog,          // Admin
  Settings,         // Pengaturan/Settings
  User,             // Profil/Profile
} from "lucide-react"
```

---

## 🧪 Testing Commands

### **Frontend Dev Server**

```bash
cd web
npm run dev
# Access: http://localhost:5173
```

### **Backend Dev Server**

```bash
cd HadirAPP
npm run start:dev
# Access: http://localhost:3000
```

### **Test Users**

```typescript
// ADMIN
{
  email: 'admin@example.com',
  password: 'password123',
  role: 'ADMIN'
}

// TEACHER
{
  email: 'teacher@example.com',
  password: 'password123',
  role: 'TEACHER'
}
```

---

## 🔧 How to Add New Menu Item

### **Step 1: Add to Sidebar (Frontend)**

```tsx
// In App.tsx, add inside appropriate role block
<SidebarMenuItem>
  <SidebarMenuButton tooltip="New Feature">
    <NewIcon className="size-4" />
    <span>New Menu</span>
  </SidebarMenuButton>
</SidebarMenuItem>
```

### **Step 2: Add Route (Frontend)**

```tsx
// In router.tsx
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <NewFeaturePage />
    </ProtectedRoute>
  } 
/>
```

### **Step 3: Add Backend Endpoint**

```typescript
// In appropriate controller
@Get('new-endpoint')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async newEndpoint() {
  return { message: 'New feature' }
}
```

---

## 🚀 How to Add STUDENT Role

### **Step 1: Update App.tsx**

```tsx
const isStudent = user?.role === 'STUDENT'

// Add student menu block
{isStudent && (
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
        {/* More student menu items */}
      </SidebarMenu>
    </SidebarGroup>
  </>
)}
```

### **Step 2: Create Student Endpoints**

```typescript
// students.controller.ts
@Controller('students')
export class StudentsController {
  @Get('my-attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async getMyAttendance(@Request() req) {
    // Return student's attendance
  }
  
  @Get('my-schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async getMySchedule(@Request() req) {
    // Return student's class schedule
  }
}
```

### **Step 3: Create Student Components**

```tsx
// student-stats-cards.tsx
export function StudentStatsCards() {
  // Fetch student stats from /students/dashboard
  // Display: Total Kehadiran, Izin, Alfa, Persentase
}

// my-attendance.tsx
export function MyAttendance() {
  // Fetch from /students/my-attendance
  // Display attendance history
}
```

---

## 📊 Role Comparison Table

| Aspect | ADMIN | TEACHER | STUDENT |
|--------|-------|---------|---------|
| **Menu Groups** | 3 | 2 | 2 |
| **Total Items** | 12 | 7 | ~6 |
| **Access Level** | Full System | Teaching Tools | Personal Only |
| **Can Create Users** | ✅ | ❌ | ❌ |
| **Can Edit Others** | ✅ | ⚠️ (Students only) | ❌ |
| **View Global Stats** | ✅ | ❌ | ❌ |
| **Manage Classes** | ✅ | ⚠️ (View only) | ❌ |
| **Attendance Input** | ✅ | ✅ | ❌ |
| **Leave Approval** | ✅ | ⚠️ (Recommend) | ❌ |
| **System Config** | ✅ | ❌ | ❌ |

---

## 🎯 Key Principles

### **1. Least Privilege**
```
Users should only see/access what they NEED
```

### **2. Role-Based Access**
```
UI + Backend both enforce role restrictions
```

### **3. Progressive Disclosure**
```
Simple for basic users, powerful for admins
```

### **4. Consistent UX**
```
Same patterns across different roles
```

---

## 📝 Checklist untuk Developer

### **Frontend:**
- [ ] Conditional rendering based on `user?.role`
- [ ] Menu items sesuai role
- [ ] No hardcoded role checks di components
- [ ] Use `authService.getUser()` untuk role detection

### **Backend:**
- [ ] All endpoints protected dengan `@UseGuards(JwtAuthGuard)`
- [ ] Role-specific endpoints use `@Roles()` decorator
- [ ] Shared endpoints filter data by role
- [ ] No sensitive data leak to unauthorized roles

### **Testing:**
- [ ] Test login as each role
- [ ] Verify correct menu shown
- [ ] Test API endpoints with different roles
- [ ] Verify 403 Forbidden for unauthorized access

---

## 🐛 Common Issues & Solutions

### **Issue: Menu tidak berubah setelah login**
```tsx
// Solution: Clear old token & re-login
localStorage.removeItem('token')
// Then login again
```

### **Issue: API returns 403 Forbidden**
```typescript
// Check:
1. Token expired? → Re-login
2. Role mismatch? → Check @Roles() decorator
3. Guard missing? → Add @UseGuards(JwtAuthGuard, RolesGuard)
```

### **Issue: Wrong menu shown for role**
```tsx
// Debug:
console.log('User:', authService.getUser())
console.log('Role:', user?.role)
console.log('isAdmin:', isAdmin)
console.log('isTeacher:', isTeacher)

// Check JWT token payload
const token = localStorage.getItem('token')
// Decode at jwt.io
```

---

## 📚 Documentation Files

1. **SIDEBAR_ACCESS_CONTROL.md** - Detailed access matrix
2. **SIDEBAR_VISUAL_COMPARISON.md** - Visual menu comparison
3. **UNIFIED_DASHBOARD_GUIDE.md** - Dashboard implementation
4. **This file** - Quick reference guide

---

**Status:** ✅ **Production Ready**

**Last Updated:** November 5, 2025

**Version:** 1.0.0
