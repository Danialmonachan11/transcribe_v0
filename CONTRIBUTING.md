# Contributing to Video Transcription & Documentation Platform

Thank you for your interest in contributing to our project! We welcome contributions from the community and are excited to work with you.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Docker and Docker Compose
- Git
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/video-transcription-docs-platform.git
   cd video-transcription-docs-platform
   ```

2. **Add the upstream repository**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/video-transcription-docs-platform.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

5. **Start the development environment**
   ```bash
   docker-compose up -d
   npm run dev
   ```

## Development Process

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/voice-cloning`)
- `fix/` - Bug fixes (e.g., `fix/transcription-timeout`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Test additions or updates (e.g., `test/e2e-recording`)

### Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Keep your branch up to date**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Test your changes**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

## Submitting Changes

### Pull Request Process

1. **Ensure your code follows all guidelines**
   - All tests pass
   - Code is properly formatted
   - Documentation is updated
   - No linting errors

2. **Write a clear PR description**
   ```markdown
   ## Description
   Brief description of what this PR does

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   Describe the tests you ran and how to reproduce them

   ## Screenshots (if applicable)
   Add screenshots to help explain your changes

   ## Checklist
   - [ ] My code follows the project's style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code where necessary
   - [ ] I have updated the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix/feature works
   - [ ] New and existing tests pass locally
   ```

3. **Submit the pull request**
   - Push your branch to your fork
   - Open a PR against the `main` branch
   - Link any related issues
   - Request reviews from maintainers

### Review Process
- At least one maintainer must approve your PR
- All CI/CD checks must pass
- Address any feedback from reviewers
- Once approved, a maintainer will merge your PR

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)

### React Components
- Use functional components with hooks
- Keep components small and reusable
- Use proper prop typing with TypeScript
- Follow the single responsibility principle

### Example
```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// Bad
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### CSS/Styling
- Use TailwindCSS utility classes
- Create custom components for repeated patterns
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### API Design
- Use RESTful conventions
- Return proper HTTP status codes
- Include error messages in responses
- Version your APIs (e.g., `/api/v1/`)

## Testing Guidelines

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Aim for 80%+ code coverage

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button label="Click me" onClick={onClick} />);
    screen.getByText('Click me').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests
- Test interactions between components
- Test API endpoints with real database
- Use test fixtures for consistent data

### End-to-End Tests
- Test complete user workflows
- Use Playwright or Cypress
- Test critical paths thoroughly

## Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Explain complex logic with inline comments
- Keep comments up to date with code changes

```typescript
/**
 * Transcribes audio from a video file using OpenAI Whisper
 * @param videoPath - Absolute path to the video file
 * @param options - Transcription options (language, model, etc.)
 * @returns Transcription result with text and timestamps
 * @throws {TranscriptionError} If the video format is unsupported
 */
export async function transcribeVideo(
  videoPath: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Implementation
}
```

### User Documentation
- Update README.md for user-facing changes
- Add examples and use cases
- Keep installation instructions current

### API Documentation
- Document all endpoints in docs/API.md
- Include request/response examples
- Note authentication requirements

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Join our Discord community for discussions
- Email the maintainers at dev@yourapp.com

Thank you for contributing to making documentation easier for everyone!
