# HadirApp Web - Teacher Dashboard# React + TypeScript + Vite



Web application untuk guru/dosen mengelola jadwal dan absensi mahasiswa.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 TeknologiCurrently, two official plugins are available:



- **Framework**: React 19 + Vite- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Language**: TypeScript- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **UI Library**: shadcn/ui + Tailwind CSS

- **Routing**: React Router v7## React Compiler

- **HTTP Client**: Axios

- **Notifications**: Sonner (Toast notifications)The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

- **Icons**: Lucide React

## Expanding the ESLint configuration

## 📋 Fitur

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

### 1. Authentication

- Login dengan email/password```js

- JWT-based authenticationexport default defineConfig([

- Auto-redirect ke dashboard setelah login  globalIgnores(['dist']),

  {

### 2. Dashboard    files: ['**/*.{ts,tsx}'],

- Statistik jadwal aktif hari ini    extends: [

- Statistik pending attendances      // Other configs...

- Jadwal minggu ini

- Quick access ke fitur utama      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

### 3. Jadwal & QR Code      // Alternatively, use this for stricter rules

- Lihat semua jadwal      tseslint.configs.strictTypeChecked,

- Create/Edit/Delete jadwal      // Optionally, add this for stylistic rules

- Generate QR Code otomatis      tseslint.configs.stylisticTypeChecked,

- Aktivasi/Deaktivasi QR Code dengan toggle button

- Download QR Code sebagai PNG      // Other configs...

- Status badges: Terjadwal (Gray), Aktif (Green), Ditutup (Red)    ],

    languageOptions: {

### 4. Konfirmasi Kehadiran      parserOptions: {

- Lihat daftar pending attendances        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- View selfie mahasiswa        tsconfigRootDir: import.meta.dirname,

- Confirm kehadiran      },

- Reject kehadiran dengan alasan      // other options...

    },

### 5. Profile  },

- View profile information])

- Update profile data```

- Upload profile photo

- Change passwordYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



## 🛠️ Setup & Installation```js

// eslint.config.js

### Prerequisitesimport reactX from 'eslint-plugin-react-x'

- Node.js >= 18import reactDom from 'eslint-plugin-react-dom'

- npm atau yarn

- Backend API running on `http://localhost:3000`export default defineConfig([

  globalIgnores(['dist']),

### Installation Steps  {

    files: ['**/*.{ts,tsx}'],

1. **Clone repository**    extends: [

```bash      // Other configs...

git clone <repository-url>      // Enable lint rules for React

cd web      reactX.configs['recommended-typescript'],

```      // Enable lint rules for React DOM

      reactDom.configs.recommended,

2. **Install dependencies**    ],

```bash    languageOptions: {

npm install      parserOptions: {

```        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

3. **Setup environment**      },

```bash      // other options...

# Create .env file    },

echo "VITE_API_URL=http://localhost:3000/api" > .env  },

```])

```

4. **Start development server**
```bash
npm run dev
```

App akan berjalan di `http://localhost:5173`

## 📱 Halaman

### `/login`
- Login page dengan email/password
- Error handling dengan toast notifications

### `/dashboard`
- Teacher statistics cards
- Jadwal hari ini
- Quick actions

### `/schedules`
- List semua jadwal
- Create new schedule button
- Edit/Delete actions
- Aktivasi/Tutup QR Code buttons
- Lihat & Download QR Code

### `/schedules/create`
- Form create jadwal baru
- Validation: Required fields, time validation

### `/schedules/:id/edit`
- Form edit jadwal existing
- Pre-filled data

### `/attendance/pending`
- Grid view pending attendances
- Selfie preview
- Confirm/Reject buttons
- Rejection reason dialog

### `/profile`
- View & edit profile
- Upload photo
- Change password

## 🎨 UI Components (shadcn/ui)

Komponen yang digunakan:
- Button
- Card
- Input
- Label
- Badge
- Dialog
- Textarea
- Avatar
- Separator
- Toast (Sonner)

## 🔄 QR Code Workflow

```
Teacher Side:
1. Create Schedule → QR Generated (SCHEDULED)
2. Click "Aktifkan" → Status: ACTIVE → QR works
3. Students scan & submit attendance
4. Click "Tutup" → Status: CLOSED → QR blocked
5. Click "Aktifkan" again → Status: ACTIVE → QR works again
```

## 📡 API Integration

Backend endpoints yang digunakan:

### Auth
- `POST /api/auth/login`

### Schedules
- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`
- `PATCH /api/schedules/:id/status`

### Attendance
- `GET /api/attendance/pending`
- `PATCH /api/attendance/:id/confirm`
- `PATCH /api/attendance/:id/reject`

### Profile
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/photo`
- `PUT /api/profile/password`

## 🎯 Development

### Build untuk production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 🧪 Test Credentials

```
Email: teacher1@test.com
Password: password123
```

## 📝 Toast Notifications

Aplikasi menggunakan Sonner untuk toast notifications dengan konfigurasi:
- Position: Top Right
- Duration: 3 seconds
- Rich colors (Green for success, Red for error)

## 🎨 Theme

- Light/Dark mode support
- System theme detection
- Toggle di header

## 🔒 Protected Routes

Semua routes (kecuali `/login`) dilindungi dengan authentication check. User akan di-redirect ke login page jika belum authenticated.

## 📦 Dependencies

Main dependencies:
```json
{
  "react": "^19.1.1",
  "react-router-dom": "^7.9.5",
  "axios": "^1.13.2",
  "sonner": "^2.0.7",
  "lucide-react": "^0.552.0",
  "tailwindcss": "^4.1.16"
}
```

## 👥 Team

Frontend web application untuk HadirApp

## 📄 License

MIT License
