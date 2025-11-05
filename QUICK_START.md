# 🚀 Quick Start - Login/Register Admin

## Langkah Cepat Testing

### 1. Start Backend (Terminal 1)
```bash
cd HadirAPP
npm run start:dev
```

### 2. Start Frontend (Terminal 2)
```bash
cd web
npm run dev
```

### 3. Buka Browser
- URL: `http://localhost:5173`
- Akan otomatis redirect ke halaman login

### 4. Register Admin Baru
1. Klik **"Daftar di sini"**
2. Isi form:
   - Email: `admin@test.com`
   - Password: `admin123`
   - Konfirmasi Password: `admin123`
3. Klik **"Daftar"**
4. Tunggu success message → auto redirect ke login

### 5. Login
1. Masukkan email: `admin@test.com`
2. Masukkan password: `admin123`
3. Klik **"Login"**
4. Berhasil! → Redirect ke dashboard admin

### 6. Logout
1. Klik avatar di sidebar (pojok kiri bawah)
2. Klik **"Log out"**
3. Akan redirect ke halaman login

## ✅ Fitur yang Sudah Bisa Dicoba

- ✅ Register admin baru
- ✅ Login dengan email/password
- ✅ Auto redirect berdasarkan role (ADMIN/TEACHER/STUDENT)
- ✅ Protected routes (coba akses `/admin/dashboard` tanpa login)
- ✅ Logout dan clear session
- ✅ Error handling (coba login dengan password salah)
- ✅ Form validation (password < 6 karakter akan error)
- ✅ Dark mode support

## 🔧 Troubleshooting

**Backend tidak bisa diakses?**
- Pastikan port 3000 tidak dipakai aplikasi lain
- Check console untuk error message

**Frontend error saat build?**
- Pastikan semua dependencies sudah terinstall: `npm install`
- Clear node_modules dan reinstall jika perlu

**CORS Error?**
- Pastikan backend sudah running terlebih dahulu
- Check `HadirAPP/src/main.ts` sudah ada konfigurasi CORS

## 📚 Dokumentasi Lengkap

Lihat file `AUTH_README.md` untuk dokumentasi detail lengkap.
