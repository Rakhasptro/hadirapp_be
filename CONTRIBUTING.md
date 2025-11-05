# Contributing to HadirApp

First off, thank you for considering contributing to HadirApp! It's people like you that make HadirApp such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript/TypeScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch from `development`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass:
   ```bash
   # Backend
   cd HadirAPP
   npm test
   
   # Frontend
   cd web
   npm test
   ```
6. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a Pull Request to the `development` branch

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` - A new feature
* `fix:` - A bug fix
* `docs:` - Documentation only changes
* `style:` - Changes that do not affect the meaning of the code
* `refactor:` - A code change that neither fixes a bug nor adds a feature
* `perf:` - A code change that improves performance
* `test:` - Adding missing tests or correcting existing tests
* `chore:` - Changes to the build process or auxiliary tools

Examples:
```
feat: add schedule conflict detection
fix: resolve authentication token expiry issue
docs: update API documentation for attendance endpoints
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Styleguide

* Use 2 spaces for indentation
* Prefer `const` over `let`. Never use `var`
* Use arrow functions when appropriate
* Use template literals instead of string concatenation
* Use async/await instead of callbacks
* Add proper TypeScript types for all functions and variables

### Documentation Styleguide

* Use Markdown for documentation
* Reference function and class names in backticks: \`functionName()\`
* Include code examples where appropriate
* Keep line length to 80 characters when possible

## Project Structure

### Backend (HadirAPP)
```
src/
├── common/          # Shared utilities, guards, decorators
├── modules/         # Feature modules
│   ├── auth/       # Authentication
│   ├── admin/      # Admin features
│   ├── teacher/    # Teacher features
│   └── ...
└── main.ts         # Application entry point
```

### Frontend (web)
```
src/
├── components/      # React components
│   ├── ui/         # shadcn/ui components
│   ├── auth/       # Auth components
│   └── dashboard/  # Dashboard components
├── pages/          # Page components
├── lib/            # Utility functions
└── hooks/          # Custom React hooks
```

## Testing

* Write unit tests for all new features
* Ensure existing tests pass before submitting PR
* Aim for high code coverage
* Test edge cases and error scenarios

### Running Tests

Backend:
```bash
cd HadirAPP
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
```

Frontend:
```bash
cd web
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Questions?

Feel free to create an issue with the question label or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
