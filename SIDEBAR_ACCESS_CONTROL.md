# 🎯 Role-Based Sidebar Access Control

## Overview

Sidebar menu di HadirApp sekarang menampilkan menu yang **berbeda** berdasarkan role user untuk memberikan akses yang sesuai dengan tanggung jawab masing-masing.

---

## 🔐 ADMIN - Full System Access

### **Menu Utama**
| Icon | Menu | Fungsi | Endpoint |
|------|------|--------|----------|
| 📊 | **Dashboard** | Overview sistem global | `/dashboard` |
| ✅ | **Kehadiran** | Kelola semua kehadiran | `/admin/attendance/*` |
| 📅 | **Jadwal** | Kelola semua jadwal | `/schedules/*` |
| 📄 | **Izin/Cuti** | Approve izin siswa & guru | `/leave/*` |
| 🔔 | **Notifikasi** | Kirim notifikasi ke semua | `/notifications/*` |

### **Manajemen**
| Icon | Menu | Fungsi | Endpoint |
|------|------|--------|----------|
| 👥 | **Pengguna** | Kelola semua user (admin, guru, siswa) | `/users/*` |
| 🎓 | **Guru** | Kelola data guru | `/teachers/*` |
| 📚 | **Kelas** | Kelola kelas | `/classes/*` |
| 📖 | **Mata Pelajaran** | Kelola courses | `/courses/*` |

### **Sistem**
| Icon | Menu | Fungsi | Endpoint |
|------|------|--------|----------|
| 📡 | **WiFi** | Kelola WiFi untuk geofencing | `/wifi/*` |
| ⚙️ | **Admin** | Pengaturan admin | `/admin/*` |
| 🔧 | **Pengaturan** | Konfigurasi sistem | `/settings` |

---

## 👨‍🏫 TEACHER - Teaching-Focused Access

### **Menu Utama**
| Icon | Menu | Fungsi | Endpoint |
|------|------|--------|----------|
| 📊 | **Dashboard** | Overview personal (jadwal, kelas) | `/dashboard` |
| 📅 | **Jadwal Mengajar** | Lihat jadwal mengajar sendiri | `/teachers/my-schedule` |
| 📚 | **Kelas Saya** | Lihat kelas yang diampu | `/teachers/my-classes` |
| ✅ | **Kehadiran** | Input kehadiran siswa di kelas | `/attendance/*` |

### **Lainnya**
| Icon | Menu | Fungsi | Endpoint |
|------|------|--------|----------|
| 📄 | **Izin Siswa** | Lihat izin siswa di kelas yang diampu | `/leave/*` |
| 🔔 | **Notifikasi** | Notifikasi untuk guru | `/notifications/*` |
| 👤 | **Profil Saya** | Edit profil personal | `/profile` |

---

## 🔍 Perbandingan Akses

### **Dashboard**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **View** | Global stats (semua siswa, guru, kelas) | Personal stats (kelas diampu, siswa) |
| **Charts** | Attendance chart seluruh sekolah | - |
| **Stats Cards** | Total Siswa, Guru, Kelas, Admin | Kelas Diampu, Mata Pelajaran, Total Siswa, Sesi Hari Ini |
| **Schedule** | Semua sesi aktif | Jadwal mengajar personal |

### **Kehadiran (Attendance)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Semua kehadiran di sistem | ✅ Hanya kelas yang diampu |
| **View** | Semua siswa | Siswa di kelas yang diampu |
| **Edit** | ✅ Edit semua data | ✅ Edit kehadiran kelas sendiri |
| **Stats** | ✅ Global attendance stats | ✅ Stats kelas yang diampu |

### **Jadwal (Schedules)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Semua jadwal sistem | ✅ Hanya jadwal mengajar sendiri |
| **Create** | ✅ Buat jadwal untuk semua guru | ❌ No create access |
| **Edit** | ✅ Edit semua jadwal | ❌ No edit access |
| **Delete** | ✅ Hapus jadwal | ❌ No delete access |

### **Kelas (Classes)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Semua kelas | ✅ Hanya kelas yang diampu |
| **View** | Semua kelas dengan detail lengkap | Kelas yang diampu + daftar siswa |
| **Manage** | ✅ CRUD kelas | ❌ View only |

### **Izin/Cuti (Leave)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Semua pengajuan izin | ✅ Izin siswa di kelas yang diampu |
| **Approve** | ✅ Approve semua izin | ⚠️ Rekomendasi (final approval by admin) |
| **View** | Izin siswa & guru | Izin siswa saja |

### **Notifikasi (Notifications)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Send** | ✅ Kirim ke semua (broadcast) | ⚠️ Kirim ke siswa di kelas yang diampu |
| **Receive** | Notifikasi sistem | Notifikasi personal |
| **Types** | System alerts, attendance reminders | Class updates, student notifications |

### **Pengguna (Users)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Full access | ❌ No access |
| **View** | Semua users (admin, guru, siswa) | - |
| **CRUD** | ✅ Create, edit, delete users | - |

### **Guru (Teachers)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Full access | ❌ No access |
| **View** | Semua guru | - |
| **CRUD** | ✅ Manage teacher data | - |

### **Mata Pelajaran (Courses)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Full access | ❌ No menu access |
| **View** | Semua courses | (Via schedule only) |
| **CRUD** | ✅ Manage courses | - |

### **WiFi Management**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Full access | ❌ No access |
| **Manage** | ✅ Add/Edit/Delete WiFi networks | - |
| **Purpose** | Geofencing for attendance | - |

### **Admin Module**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | ✅ Full access | ❌ No access |
| **Functions** | System stats, reports, analytics | - |

### **Profil (Profile)**
| Feature | ADMIN | TEACHER |
|---------|-------|---------|
| **Access** | Via Settings | ✅ Dedicated menu |
| **Edit** | Edit own profile | Edit own profile |

---

## 🎯 Implementation Details

### **Conditional Sidebar Rendering**

```tsx
// App.tsx
const user = authService.getUser()
const isAdmin = user?.role === 'ADMIN'
const isTeacher = user?.role === 'TEACHER'

<SidebarContent>
  {/* ADMIN Menu */}
  {isAdmin && (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
        {/* Admin menu items */}
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
        {/* Management menu items */}
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Sistem</SidebarGroupLabel>
        {/* System menu items */}
      </SidebarGroup>
    </>
  )}

  {/* TEACHER Menu */}
  {isTeacher && (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
        {/* Teacher menu items */}
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Lainnya</SidebarGroupLabel>
        {/* Other menu items */}
      </SidebarGroup>
    </>
  )}
</SidebarContent>
```

---

## 🔒 Backend Protection

Semua endpoint dilindungi dengan **Guards** di backend:

### **Admin-Only Endpoints**
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  // Only ADMIN can access
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  // Only ADMIN can access
}
```

### **Teacher-Specific Endpoints**
```typescript
@Controller('teachers')
export class TeachersController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getTeacherDashboard() {
    // Only TEACHER can access
  }
  
  @Get('my-schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getMySchedule() {
    // Only TEACHER can access
  }
}
```

### **Shared Endpoints (with filtering)**
```typescript
@Controller('attendance')
export class AttendanceController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAttendance(@Request() req) {
    // ADMIN: sees all attendance
    // TEACHER: sees only their classes' attendance
    if (req.user.role === 'ADMIN') {
      return this.getAllAttendance()
    } else if (req.user.role === 'TEACHER') {
      return this.getTeacherAttendance(req.user.id)
    }
  }
}
```

---

## 📊 Menu Count

### **ADMIN Sidebar**
- **Menu Utama**: 5 items
- **Manajemen**: 4 items
- **Sistem**: 3 items
- **Total**: 12 menu items

### **TEACHER Sidebar**
- **Menu Utama**: 4 items
- **Lainnya**: 3 items
- **Total**: 7 menu items

---

## ✅ Access Control Matrix

| Module | ADMIN | TEACHER | STUDENT |
|--------|-------|---------|---------|
| Dashboard | ✅ Global | ✅ Personal | ✅ Personal |
| Attendance | ✅ All | ✅ Own classes | ✅ Own attendance |
| Schedules | ✅ All | ✅ Teaching schedule | ✅ Class schedule |
| Leave | ✅ All | ✅ Students' leave | ✅ Own leave |
| Notifications | ✅ Broadcast | ✅ Class notifications | ✅ Personal |
| Users | ✅ CRUD | ❌ | ❌ |
| Teachers | ✅ CRUD | ❌ | ❌ |
| Classes | ✅ CRUD | ✅ View (teaching) | ✅ View (enrolled) |
| Courses | ✅ CRUD | ✅ View (teaching) | ✅ View (enrolled) |
| WiFi | ✅ CRUD | ❌ | ❌ |
| Admin | ✅ Full | ❌ | ❌ |
| Profile | ✅ Own | ✅ Own | ✅ Own |

---

## 🚀 Benefits

### **1. Security**
- ✅ Menu items hidden based on role
- ✅ Backend endpoints protected with Guards
- ✅ No unauthorized access possible

### **2. User Experience**
- ✅ Cleaner interface (only relevant menus shown)
- ✅ Faster navigation (less clutter)
- ✅ Role-specific workflows

### **3. Maintainability**
- ✅ Single sidebar component
- ✅ Conditional rendering
- ✅ Easy to add new roles (e.g., STUDENT)

---

## 🔧 How to Test

### **Test as ADMIN:**
```bash
# Login dengan user ADMIN
Email: admin@example.com
Password: password123

# Expected sidebar:
- Menu Utama (5 items)
- Manajemen (4 items)
- Sistem (3 items)
```

### **Test as TEACHER:**
```bash
# Login dengan user TEACHER
Email: teacher@example.com
Password: password123

# Expected sidebar:
- Menu Utama (4 items)
- Lainnya (3 items)
```

---

## 📝 Future Enhancements

### **STUDENT Role** (Coming Soon)
Akan ditambahkan menu untuk siswa:
- **Menu Utama**: Dashboard, Jadwal Kelas, Kehadiran Saya, Izin/Cuti
- **Lainnya**: Notifikasi, Profil Saya

### **Dynamic Menu Items**
Bisa ditambahkan fitur untuk:
- Load menu items from backend
- Custom permissions per user
- Feature flags for beta features

---

## 📄 Files Modified

1. **`web/src/App.tsx`**
   - Added conditional sidebar rendering
   - `isAdmin` → Show admin menu
   - `isTeacher` → Show teacher menu

2. **Backend Guards** (Already exist)
   - `JwtAuthGuard` - Authentication check
   - `RolesGuard` - Role-based authorization
   - `@Roles()` decorator - Specify allowed roles

---

**Status:** ✅ **Implemented & Ready to Test**

Sekarang ADMIN dan TEACHER memiliki akses menu yang berbeda sesuai dengan tanggung jawab mereka! 🎯
