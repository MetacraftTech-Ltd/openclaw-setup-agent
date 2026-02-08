# Changelog

All notable changes to the OpenClaw Setup Agent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-beta.1] - 2025-01-27

### Added - PRIORITY 0 (Must Have)

#### Subscription Detection Flow
- **NEW**: First-step subscription detection wizard
- Ask users about their current AI usage (ChatGPT Plus/Pro/Max, Claude Pro/Max, etc.)
- Intelligent routing based on subscription type
- Proxy setup guidance for Max plan users
- API warning for Pro plan users without direct API access
- Dedicated free model path for users without subscriptions

#### System Pre-Check
- **NEW**: Comprehensive hardware analysis before model selection
- Memory detection (Linux: `free -m`, macOS: `sysctl hw.memsize`, Windows: `wmic`)
- Disk space checking (`df -h` on Unix, `dir /-c` on Windows)
- GPU detection (nvidia-smi for NVIDIA, Metal detection for Apple Silicon)
- Hardware-based recommendations:
  - RAM < 8GB: Cloud-only recommendations
  - RAM >= 16GB: Local LLM options via Ollama
  - Disk space warnings when < 10GB free

#### Free Model Fallback
- **NEW**: Complete free model configuration system
- Kimi K2.5 integration (free via Nvidia NIM)
- Google Gemini Flash free tier setup
- Hugging Face Inference API support
- Clear warnings about free model limitations
- Upgrade path suggestions with cost-benefit analysis

### Added - PRIORITY 1 (Important)

#### Security Hardening
- **NEW**: Automatic security configuration during setup
- Gateway address forced to 127.0.0.1 (localhost only)
- Token authentication enabled by default
- DM policy set to "pairing", group policy disabled
- Configuration file permissions set to 700 (owner-only)
- Rate limiting and input validation enabled
- Security logging configuration
- Tailscale recommendations for secure remote access

#### Smart Model Recommendations
- **NEW**: Context-aware model suggestions
- Warning against GPT-4.1 (tool execution issues)
- Claude Sonnet recommended as balanced choice
- Opus/GPT-5 suggestions for onboarding only
- Cost optimization guidance (expensive models for setup, cheaper for daily)
- Hardware-specific local model recommendations

#### Post-Setup Guide
- **NEW**: Personalized setup guide generation
- "Your bot is running! Here's what to do next..." guide
- Channel-specific first task suggestions
- Commands cheatsheet based on user experience level
- Use-case specific automation examples
- Troubleshooting section with common issues

### Added - PRIORITY 2 (Nice to Have)

#### Starter Config Bundle
- Pre-configured daily digest recommendations
- Web search integration with Brave API prompts
- Memory management tips in generated documentation
- Experience-level appropriate feature suggestions

#### Cost Optimizer Config
- **NEW**: Multi-tier provider configuration system
- Primary: Claude Sonnet for balanced performance
- Fallback: Kimi K2.5 free tier for cost savings
- Onboarding: Claude Opus for highest quality initial experience
- Intelligent provider switching based on task complexity

### Enhanced

#### Environment Analysis
- Extended hardware detection capabilities
- Better cross-platform compatibility
- Enhanced error handling and fallbacks
- More detailed system recommendations

#### Provider Configuration
- Subscription-aware provider recommendations
- Hardware-capability-based filtering
- Enhanced API key validation
- Better error messages and guidance

#### User Experience
- Improved wizard flow with better explanations
- Context-sensitive help and recommendations
- Progress indicators for long-running checks
- Better error recovery and retry mechanisms

### Technical Improvements

#### Code Organization
- New modular architecture with specialized modules
- Separation of concerns (detection, configuration, security, documentation)
- Better error handling and validation
- Comprehensive type checking and input validation

#### Security
- Defense-in-depth approach to configuration
- Secure defaults for all settings
- Comprehensive security validation
- Detailed security documentation

#### Documentation
- Dynamic documentation generation
- User-specific setup guides
- Context-aware troubleshooting
- Progressive complexity based on user experience

### Dependencies
- No new external dependencies added
- All new features built with existing dependency stack
- Enhanced use of existing inquirer, chalk, and ora capabilities

### Breaking Changes
- None - fully backward compatible with existing configurations
- Enhanced configuration options are additive only

### Migration Guide
- No migration needed for existing users
- New features automatically available on next setup run
- Existing configurations remain valid

---

## [1.0.0-beta.1] - 2025-01-20

### Added
- Initial release of OpenClaw Setup Agent
- Interactive setup wizard for OpenClaw
- Environment analysis and compatibility checking
- AI provider configuration (Anthropic, OpenAI, OpenRouter, Ollama)
- Communication channel setup (WhatsApp, Telegram, Discord, Slack)
- Configuration validation and testing
- Basic security recommendations

### Features
- Cross-platform support (macOS, Linux, Windows/WSL)
- Multiple AI provider support
- Channel-agnostic communication setup
- Automatic dependency detection
- Configuration file generation
- Setup validation and testing

---

## Development Notes

### Version 1.1.0-beta.1 Focus Areas

**Enhanced User Onboarding**: The subscription detection flow significantly improves the initial user experience by understanding their current AI setup and providing appropriate guidance.

**Hardware-Aware Setup**: System pre-checks ensure users get recommendations that match their hardware capabilities, preventing frustration with incompatible configurations.

**Security by Default**: Automatic security hardening means users get secure configurations without needing to understand complex security concepts.

**Comprehensive Documentation**: Post-setup guides provide ongoing value and reduce support burden by giving users clear next steps.

**Cost Optimization**: Smart recommendations help users balance cost and performance based on their actual usage patterns.

### Testing Notes

The new features have been designed to gracefully degrade if hardware detection fails, ensuring the setup process remains robust across different environments.

All new modules include comprehensive error handling and fallback mechanisms to maintain reliability.

### Future Roadmap

Version 1.2.0 will focus on:
- Enhanced team setup and management
- Advanced automation workflow configuration  
- Enterprise security features
- Integration with external monitoring systems