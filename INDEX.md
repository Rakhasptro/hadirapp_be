# 📚 HadirApp Authentication - Documentation Index

Selamat datang di dokumentasi sistem authentication HadirApp! Gunakan index ini untuk menavigasi semua dokumentasi yang tersedia.

## 🚀 Getting Started

**Baru memulai? Mulai dari sini:**

1. 📖 **[README_AUTH.md](README_AUTH.md)** - Overview lengkap sistem auth
2. ⚡ **[QUICK_START.md](QUICK_START.md)** - Panduan cepat untuk testing
3. ✅ **[CHECKLIST.md](CHECKLIST.md)** - Checklist implementasi

## 📋 Documentation Files

### Main Documentation

| File | Tujuan | Kapan Digunakan |
|------|--------|-----------------|
| **[README_AUTH.md](README_AUTH.md)** | Overview lengkap sistem authentication | Baca pertama kali untuk memahami keseluruhan sistem |
| **[QUICK_START.md](QUICK_START.md)** | Panduan cepat testing | Ketika ingin langsung testing tanpa baca dokumentasi panjang |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | Ringkasan implementasi & file yang dibuat | Untuk review apa saja yang sudah dibuat |
| **[CHECKLIST.md](CHECKLIST.md)** | Daftar tugas implementasi | Untuk tracking progress implementasi |

### Detailed Documentation

| File | Tujuan | Kapan Digunakan |
|------|--------|-----------------|
| **[web/AUTH_README.md](web/AUTH_README.md)** | Dokumentasi detail authentication system | Ketika butuh informasi teknis detail tentang auth flow |
| **[web/VISUAL_GUIDE.md](web/VISUAL_GUIDE.md)** | Diagram UI & flow | Untuk memahami user flow dan tampilan visual |
| **[web/TROUBLESHOOTING.md](web/TROUBLESHOOTING.md)** | Panduan troubleshooting | Ketika mengalami masalah/error |

### Testing Scripts

| File | Tujuan | Platform |
|------|--------|----------|
| **[test-auth.sh](test-auth.sh)** | Script testing otomatis | Linux / Mac / Git Bash |
| **[test-auth.bat](test-auth.bat)** | Script testing otomatis | Windows CMD |

## 🎯 Navigation by Use Case

### "Saya ingin langsung coba aplikasinya"
→ Baca: **[QUICK_START.md](QUICK_START.md)**

### "Saya ingin memahami cara kerja authentication"
→ Baca: **[web/AUTH_README.md](web/AUTH_README.md)**

### "Saya ingin lihat flow diagram dan preview UI"
→ Baca: **[web/VISUAL_GUIDE.md](web/VISUAL_GUIDE.md)**

### "Aplikasi saya error, tidak bisa jalan"
→ Baca: **[web/TROUBLESHOOTING.md](web/TROUBLESHOOTING.md)**

### "Saya ingin review apa saja yang sudah dibuat"
→ Baca: **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**

### "Saya ingin testing API endpoint"
→ Jalankan: **[test-auth.sh](test-auth.sh)** atau **[test-auth.bat](test-auth.bat)**

## 📁 File Structure

```
hadirapp_db/
├── README_AUTH.md                      # Overview utama
├── QUICK_START.md                      # Panduan cepat
├── IMPLEMENTATION_SUMMARY.md           # Ringkasan implementasi
├── CHECKLIST.md                        # Checklist implementasi
├── INDEX.md                            # File ini - navigation
├── test-auth.sh                        # Testing script (Linux/Mac)
├── test-auth.bat                       # Testing script (Windows)
│
├── HadirAPP/                          # Backend
│   ├── src/
│   │   ├── modules/auth/              # Auth module
│   │   └── main.ts                    # CORS config
│   └── prisma/
│       └── schema.prisma
│
└── web/                               # Frontend
    ├── AUTH_README.md                 # Dokumentasi detail auth
    ├── VISUAL_GUIDE.md                # UI previews & diagrams
    ├── TROUBLESHOOTING.md             # Panduan troubleshooting
    ├── src/
    │   ├── components/auth/           # Auth components
    │   ├── lib/                       # Services & utils
    │   ├── pages/                     # Pages
    │   └── router.tsx                 # Routing config
    └── .env                           # Environment variables
```

## 🎓 Learning Path

Jika Anda ingin belajar step-by-step, ikuti urutan ini:

1. **Fase 1: Understand** (15 menit)
   - Baca [README_AUTH.md](README_AUTH.md) bagian Features & Tech Stack
   - Lihat [web/VISUAL_GUIDE.md](web/VISUAL_GUIDE.md) untuk memahami flow

2. **Fase 2: Setup** (10 menit)
   - Ikuti [QUICK_START.md](QUICK_START.md) untuk running aplikasi
   - Pastikan backend dan frontend berjalan

3. **Fase 3: Testing** (15 menit)
   - Test manual register & login di browser
   - Jalankan [test-auth.bat](test-auth.bat) untuk test API
   - Coba akses protected routes

4. **Fase 4: Deep Dive** (30 menit)
   - Baca [web/AUTH_README.md](web/AUTH_README.md) untuk detail teknis
   - Review source code di `web/src/components/auth/`
   - Pahami axios interceptor di `web/src/lib/axios.ts`

5. **Fase 5: Troubleshooting** (jika perlu)
   - Gunakan [web/TROUBLESHOOTING.md](web/TROUBLESHOOTING.md) jika ada error

## 🔍 Quick Reference

### API Endpoints
```
POST /api/auth/register    # Register user baru
POST /api/auth/login       # Login dengan email/password
```

### Frontend Routes
```
/login                     # Login/Register page
/admin/dashboard          # Admin dashboard (protected)
/teacher/dashboard        # Teacher dashboard (protected)
/student/dashboard        # Student dashboard (protected)
/unauthorized             # 403 error page
```

### Key Files
```
Backend:
- HadirAPP/src/modules/auth/auth.controller.ts
- HadirAPP/src/modules/auth/auth.service.ts
- HadirAPP/src/main.ts (CORS)

Frontend:
- web/src/components/auth/login-form.tsx
- web/src/components/auth/register-form.tsx
- web/src/lib/auth.ts (auth service)
- web/src/lib/axios.ts (HTTP client)
- web/src/router.tsx (routing)
```

## 🛠 Development Tools

### Scripts
```bash
# Backend
cd HadirAPP
npm run start:dev        # Start dev server
npm run build           # Build production
npm run test            # Run tests

# Frontend
cd web
npm run dev             # Start dev server
npm run build           # Build production
npm run preview         # Preview production build
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api

# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
PORT=3000
```

## 📊 Status

- ✅ Login/Register UI - **Complete**
- ✅ Backend Integration - **Complete**
- ✅ Protected Routes - **Complete**
- ✅ Role-based Access - **Complete**
- ✅ JWT Authentication - **Complete**
- ✅ Error Handling - **Complete**
- ✅ Documentation - **Complete**
- ✅ Testing Scripts - **Complete**

## 💡 Tips

1. **Gunakan QUICK_START.md** jika ingin cepat
2. **Baca TROUBLESHOOTING.md** jika ada error
3. **Lihat VISUAL_GUIDE.md** untuk memahami UI flow
4. **Jalankan test-auth.bat** untuk test API
5. **Review CHECKLIST.md** untuk tracking progress

## 🆘 Need Help?

Jika masih bingung atau ada pertanyaan:

1. Cek [TROUBLESHOOTING.md](web/TROUBLESHOOTING.md) untuk masalah umum
2. Review [VISUAL_GUIDE.md](web/VISUAL_GUIDE.md) untuk flow diagram
3. Baca [AUTH_README.md](web/AUTH_README.md) untuk detail lengkap
4. Check browser console & backend logs untuk error messages

## 📝 Notes

- Semua password minimal 6 karakter
- Default role register adalah ADMIN
- Token disimpan di localStorage
- CORS sudah dikonfigurasi untuk localhost:5173
- Backend berjalan di port 3000
- Frontend berjalan di port 5173

---

**Happy Coding! 🚀**

Made with ❤️ for HadirApp
