# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-05

### Added
- **Backend (NestJS)**
  - Complete REST API with JWT authentication
  - Role-based access control (ADMIN, TEACHER, STUDENT)
  - Attendance management system with session tracking
  - Schedule management with automatic conflict detection
  - User management for students, teachers, and administrators
  - Leave request system with approval workflow
  - WiFi network integration for location-based attendance
  - Prisma ORM with MySQL database support
  - Comprehensive API documentation

- **Frontend (React)**
  - Unified dashboard with role-specific content
  - Real-time attendance tracking interface
  - Schedule management UI with full CRUD operations
  - Profile management with view and edit capabilities
  - Authentication pages (login/register)
  - Dark mode support with theme toggle
  - Mobile-first responsive design
  - shadcn/ui component library integration
  - Toast notifications for user feedback

- **Features by Role**
  - **ADMIN**: 
    - Dashboard with comprehensive statistics
    - Attendance session management
    - Schedule CRUD with conflict validation
    - User and class management
    - Reports and analytics
  - **TEACHER**: 
    - Personal schedule view
    - Attendance session creation
    - Student attendance tracking
    - Class management
  - **STUDENT**: 
    - Personal attendance history
    - Schedule viewing
    - Leave request submission

- **Database**
  - Complete schema for educational institution
  - 9 migration files included
  - Relational data model with proper constraints
  - Support for attendance tracking, schedules, users, classes, courses

- **Documentation**
  - Comprehensive README with setup instructions
  - API endpoint documentation
  - Feature-specific guides
  - Role-based access control documentation
  - Contributing guidelines
  - Quick start guide

### Security
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based authorization guards
- Environment variable protection
- CORS configuration
- Input validation and sanitization

### Technical
- TypeScript for type safety
- Prisma for database management
- React 19 for modern UI
- Vite for fast development
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router v6 for navigation

[1.0.0]: https://github.com/Rakhasptro/hadirapp_be/releases/tag/v1.0.0
