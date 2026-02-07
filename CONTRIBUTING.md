# Contributing to OpenClaw Setup Agent

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/issues) first
2. If new, [create an issue](https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/issues/new) with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node.js version, etc.)

### Suggesting Features

1. Check [existing issues](https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/issues) for similar ideas
2. [Create a feature request](https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/issues/new) with:
   - Clear description of the feature
   - Use case / why it's valuable
   - Proposed implementation (if you have ideas)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit with clear messages: `git commit -m "feat: add cool new feature"`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/openclaw-setup-agent.git
cd openclaw-setup-agent

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Code Style

- Use ES modules (`import`/`export`)
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, no code change
- `refactor:` Code change that neither fixes nor adds
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add support for Google Gemini provider
fix: handle missing API key gracefully
docs: update installation instructions
```

## Testing

- Add tests for new features
- Don't break existing tests
- Test on multiple Node.js versions if possible

## Code of Conduct

Be respectful. We're all here to build something useful.

- Be welcoming to newcomers
- Be patient with questions
- Provide constructive feedback
- Focus on what's best for users

## Questions?

- Open a [GitHub Discussion](https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/discussions)
- Email: contribute@kingos.net

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make OpenClaw Setup Agent better! 🦾
