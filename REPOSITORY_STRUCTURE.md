# GitHub Repository Structure

## 📦 Repository Information

**Repository**: [hadirapp_be](https://github.com/Rakhasptro/hadirapp_be)  
**Owner**: Rakhasptro  
**License**: MIT  
**Version**: v1.0.0

## 🌿 Branch Structure

### `master` (Production Branch)
- Contains stable, production-ready code
- Protected branch
- All releases are tagged from this branch
- Current version: v1.0.0

### `development` (Development Branch)
- Active development happens here
- Feature branches are merged into this branch
- Periodically merged into master for releases

### Feature Branches
- Create from `development`
- Naming convention: `feature/feature-name`
- Delete after merging

## 📁 Repository Contents

```
hadirapp_be/
├── HadirAPP/                          # Backend (NestJS + Prisma)
│   ├── src/                          # Source code
│   │   ├── common/                   # Shared code (guards, decorators)
│   │   ├── modules/                  # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── admin/               # Admin features
│   │   │   ├── teacher/             # Teacher features
│   │   │   ├── attendance/          # Attendance management
│   │   │   ├── schedules/           # Schedule management
│   │   │   └── ...                  # Other modules
│   │   └── main.ts                  # Entry point
│   ├── prisma/                       # Database schema & migrations
│   ├── test/                         # Test files
│   └── package.json                  # Dependencies
│
├── web/                               # Frontend (React + TypeScript)
│   ├── src/                          # Source code
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # UI components (shadcn)
│   │   │   ├── auth/                # Auth components
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   └── layout/              # Layout components
│   │   ├── pages/                   # Page components
│   │   ├── lib/                     # Utilities
│   │   ├── hooks/                   # Custom hooks
│   │   └── router.tsx               # Route configuration
│   ├── public/                       # Static assets
│   └── package.json                  # Dependencies
│
├── docs/                              # Documentation (*.md files)
│   ├── ADMIN_ATTENDANCE_ANALYSIS.md  # Attendance feature docs
│   ├── ADMIN_SCHEDULES_FEATURE.md    # Schedule feature docs
│   ├── DASHBOARD_INTEGRATION.md      # Dashboard guide
│   ├── SIDEBAR_ACCESS_CONTROL.md     # Access control guide
│   └── ...                           # Other documentation
│
├── README.md                          # Main documentation
├── CHANGELOG.md                       # Version history
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # MIT License
└── .gitignore                        # Git ignore rules
```

## 🏷️ Tags & Releases

### v1.0.0 (Initial Release)
- Complete attendance management system
- Role-based access control
- Schedule management
- Responsive UI with dark mode

## 🔄 Git Workflow

### For Contributors

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone
   git clone https://github.com/YOUR-USERNAME/hadirapp_be.git
   cd hadirapp_be
   ```

2. **Create feature branch**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub to 'development' branch
   ```

### For Maintainers

1. **Merge feature to development**
   ```bash
   git checkout development
   git merge feature/feature-name
   git push origin development
   ```

2. **Release to production**
   ```bash
   git checkout master
   git merge development
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin master --tags
   ```

## 📊 Statistics

- **Total Files**: 165+
- **Lines of Code**: 33,000+
- **Languages**: TypeScript, JavaScript, SQL
- **Dependencies**: 
  - Backend: 40+ packages
  - Frontend: 35+ packages

## 🔗 Important Links

- **Repository**: https://github.com/Rakhasptro/hadirapp_be
- **Issues**: https://github.com/Rakhasptro/hadirapp_be/issues
- **Pull Requests**: https://github.com/Rakhasptro/hadirapp_be/pulls
- **Releases**: https://github.com/Rakhasptro/hadirapp_be/releases

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test-related changes
- `chore:` - Build process or tooling changes

## 🛡️ Branch Protection Rules

### Master Branch
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

### Development Branch
- ✅ Require pull request reviews
- ✅ Require status checks to pass

## 📦 Release Process

1. Update version in `package.json` files
2. Update `CHANGELOG.md` with changes
3. Merge to master
4. Create git tag: `v1.x.x`
5. Push tag to trigger release
6. Create GitHub release with notes

## 🤝 Collaboration

- **Code Review**: All PRs require review
- **Testing**: All PRs must pass tests
- **Documentation**: Update docs with changes
- **Communication**: Use issues for discussions

## 📈 Project Health

- ✅ Active development
- ✅ Well documented
- ✅ Test coverage
- ✅ Modern tech stack
- ✅ Production ready

---

**Last Updated**: November 5, 2025  
**Repository Status**: Active
