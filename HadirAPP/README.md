# HadirApp - QR Code Attendance System API<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>

Backend API untuk sistem absensi berbasis QR Code dengan teknologi NestJS dan Prisma.</p>



## 🚀 Teknologi[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

- **Framework**: NestJS (Node.js framework)

- **Database**: MySQL dengan Prisma ORM  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- **Authentication**: JWT (JSON Web Token)    <p align="center">

- **Image Processing**: Multer untuk upload selfie<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

- **QR Code**: QRCode library untuk generate QR Code<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

## 📋 Fitur Utama<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

### 1. Authentication & Authorization<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

- Login dengan email/password<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

- JWT-based authentication  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

- Role-based access control (Teacher only untuk web app)    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

### 2. Schedule Management (Teacher)</p>

- Create, update, delete jadwal perkuliahan  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

- Generate QR Code unik untuk setiap jadwal  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

- Aktivasi/deaktivasi QR Code (status: SCHEDULED/ACTIVE/CLOSED)

- Download QR Code sebagai PNG image## Description



### 3. Attendance System[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

- Student submit attendance dengan scan QR Code

- Upload selfie sebagai bukti kehadiran## Project setup

- Validasi QR Code (hanya bisa digunakan saat status ACTIVE)

- Validasi tanggal (QR Code hanya valid di tanggal yang ditentukan)```bash

- Teacher confirm/reject attendance submissions$ npm install

```

### 4. Profile Management

- Update profile data (name, email, phone, address)## Compile and run the project

- Upload photo profile

- Change password```bash

# development

## 🗂️ Struktur Database$ npm run start



```prisma# watch mode

User$ npm run start:dev

├── id (CUID)

├── email (unique)# production mode

├── password (hashed)$ npm run start:prod

├── role (TEACHER/STUDENT)```

└── profile (one-to-one)

## Run tests

TeacherProfile / StudentProfile

├── id (CUID)```bash

├── userId (foreign key)# unit tests

├── name$ npm run test

├── nip/nim

├── email# e2e tests

├── gender$ npm run test:e2e

├── phone

├── address# test coverage

└── photo$ npm run test:cov

```

Schedule

├── id (CUID)## Deployment

├── teacherId (foreign key)

├── courseNameWhen you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

├── courseCode

├── dateIf you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

├── startTime

├── endTime```bash

├── room$ npm install -g @nestjs/mau

├── topic$ mau deploy

├── status (SCHEDULED/ACTIVE/CLOSED)```

├── qrCode (unique token)

└── qrCodeImage (base64 PNG)With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.



Attendance## Resources

├── id (CUID)

├── scheduleId (foreign key)Check out a few resources that may come in handy when working with NestJS:

├── studentId (foreign key)

├── timestamp- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

├── status (PENDING/CONFIRMED/REJECTED)- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

├── selfieImage (filename)- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).

└── rejectionReason- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

```- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

## 🛠️ Setup & Installation- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

### Prerequisites

- Node.js >= 18## Support

- MySQL Database

- npm atau yarnNest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).



### Installation Steps## Stay in touch



1. **Clone repository**- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)

```bash- Website - [https://nestjs.com](https://nestjs.com/)

git clone <repository-url>- Twitter - [@nestframework](https://twitter.com/nestframework)

cd HadirAPP

```## License



2. **Install dependencies**Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

```bash
npm install
```

3. **Setup database**
```bash
# Create .env file
cp .env.example .env

# Edit .env file dengan database credentials Anda
DATABASE_URL="mysql://user:password@localhost:3306/hadirapp"
JWT_SECRET="your-secret-key"
```

4. **Run migrations**
```bash
npx prisma migrate dev
```

5. **Seed database (optional)**
```bash
npx prisma db seed
```

6. **Start development server**
```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login         - Login
POST   /api/auth/register      - Register new user
```

### Schedules (Teacher)
```
GET    /api/schedules          - Get all schedules
GET    /api/schedules/:id      - Get schedule by ID
POST   /api/schedules          - Create new schedule
PUT    /api/schedules/:id      - Update schedule
DELETE /api/schedules/:id      - Delete schedule
PATCH  /api/schedules/:id/status - Change schedule status (ACTIVE/CLOSED)
```

### Attendance
```
GET    /api/attendance/pending           - Get pending attendances (Teacher)
POST   /api/attendance/submit            - Submit attendance (Student)
PATCH  /api/attendance/:id/confirm       - Confirm attendance (Teacher)
PATCH  /api/attendance/:id/reject        - Reject attendance (Teacher)
```

### Profile
```
GET    /api/profile            - Get user profile
PUT    /api/profile            - Update profile
POST   /api/profile/photo      - Upload profile photo
PUT    /api/profile/password   - Change password
```

### Public Endpoints (No Auth Required)
```
GET    /api/public/schedules/verify/:qrCode - Verify QR Code
```

## 🔒 Authentication

Semua endpoint (kecuali `/api/auth/*` dan `/api/public/*`) memerlukan JWT token di header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎯 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Production Build

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## 🔄 QR Code Flow

1. **Teacher** membuat jadwal → QR Code di-generate otomatis (status: SCHEDULED)
2. **Teacher** mengaktifkan QR Code → Status berubah ke ACTIVE
3. **Student** scan QR Code → Submit attendance dengan selfie
4. **Teacher** melihat pending attendances → Confirm/Reject
5. **Teacher** menutup QR Code → Status berubah ke CLOSED (QR Code tidak bisa digunakan)
6. **Teacher** bisa mengaktifkan kembali jadwal yang sudah ditutup

## 🎨 Status Flow

```
SCHEDULED (Initial)
    ↓
ACTIVE (QR Code works)
    ↓
CLOSED (QR Code blocked)
    ↓
ACTIVE (Can reopen)
```

## 📝 Notes

- QR Code hanya bisa digunakan saat status = ACTIVE
- QR Code hanya valid di tanggal yang ditentukan
- Setiap jadwal memiliki QR Code unik
- Selfie image disimpan di folder `uploads/selfies/`
- Profile photo disimpan di folder `uploads/profiles/`

## 👥 Team

Backend API untuk HadirApp Web & Mobile

## 📄 License

MIT License
