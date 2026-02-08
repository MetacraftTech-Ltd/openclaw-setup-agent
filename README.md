# OpenClaw Setup Agent

🦾 **AI-powered setup assistant for OpenClaw** - Get from zero to working AI assistant in under 30 minutes.

[![npm version](https://badge.fury.io/js/openclaw-setup.svg)](https://www.npmjs.com/package/openclaw-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/openclaw-setup.svg)](https://nodejs.org/)

## What is this?

The OpenClaw Setup Agent is an intelligent CLI tool that automates the complex process of setting up [OpenClaw (Clawdbot)](https://github.com/anthropics/clawdbot), an advanced AI assistant framework. Instead of wrestling with configuration files, API keys, and integration setup, this agent guides you through an interactive process that gets you up and running quickly.

**NEW in v1.1.0:** Smart subscription detection, hardware-aware recommendations, automatic security hardening, and personalized post-setup guides!

## ✨ Features

### 🆕 NEW in v1.1.0-beta.1
- 🔍 **Smart Subscription Detection** - Detects your current AI subscriptions (ChatGPT Plus/Pro, Claude Pro/Max) and routes setup accordingly
- 🖥️ **Hardware-Aware Recommendations** - Analyzes RAM, disk, and GPU to recommend optimal configurations
- 🆓 **Free Model Support** - Complete setup path for users without subscriptions (Kimi K2.5, Gemini Flash)
- 🛡️ **Automatic Security Hardening** - Applies security best practices by default (localhost binding, token auth, secure permissions)
- 📖 **Personalized Post-Setup Guide** - Generates custom documentation with next steps based on your setup
- 💡 **Smart Model Recommendations** - Warns against problematic models, suggests cost-optimal configurations

### Core Features
- 🧠 **Intelligent Environment Analysis** - Automatically detects your system and identifies potential issues
- 🔧 **Interactive Configuration** - Step-by-step setup with smart defaults and recommendations
- 🤖 **Multiple AI Providers** - Support for Anthropic Claude, OpenAI GPT, OpenRouter, local models (Ollama), and free services
- 💬 **Multi-Channel Setup** - Configure WhatsApp, Telegram, Discord, Slack, and Terminal interfaces
- ✅ **Validation & Testing** - Ensures your configuration works before completing setup
- 🛡️ **Security-First** - Implements best practices for API key management and access control
- 📚 **Comprehensive Documentation** - Generates personalized setup docs for your specific configuration

## 🚀 Quick Start

### Option 1: Run with npx (Recommended)
```bash
npx openclaw-setup
```

### Option 2: Global Installation
```bash
npm install -g openclaw-setup
openclaw-setup
```

### Option 3: Local Installation
```bash
npm install openclaw-setup
npx openclaw-setup
```

## 📋 Requirements

- **Node.js 18.0.0 or newer**
- **npm, pnpm, or yarn** package manager
- **Internet connection** for package installation and API validation
- **At least 500MB** of free disk space

**Supported Platforms:**
- ✅ macOS (10.15+)
- ✅ Linux (Ubuntu, Debian, Fedora, Arch)
- ⚠️ Windows (via WSL2 or PowerShell)

## 🎯 What This Tool Does

### 1. Subscription Detection (NEW)
- Automatically detects your current AI service usage
- Routes setup based on ChatGPT Plus/Pro/Max, Claude Pro/Max subscriptions
- Provides proxy setup guidance for subscription users
- Dedicated free model path for users without paid subscriptions

### 2. System Pre-Check (NEW)
- Comprehensive hardware analysis (RAM, disk space, GPU)
- Hardware-capability-based recommendations
- Local AI model feasibility assessment
- Performance optimization suggestions

### 3. Environment Analysis
- Detects your operating system and architecture
- Checks Node.js and package manager versions
- Analyzes network connectivity and proxy settings
- Identifies potential conflicts with existing installations

### 4. AI Provider Setup (Enhanced)
- **Anthropic Claude** - OpenClaw's recommended provider with smart model selection
- **OpenAI GPT** - Popular choice with GPT-4 and GPT-4o (warns against GPT-4.1)
- **OpenRouter** - Access multiple models through one API
- **Local Models** - Privacy-focused Ollama integration with hardware matching
- **Free Models (NEW)** - Kimi K2.5, Gemini Flash, Hugging Face integration
- **Custom Providers** - OpenAI-compatible APIs

### 5. Communication Channels
- **WhatsApp** - Chat via WhatsApp Web (QR code pairing)
- **Telegram** - Fast bot integration with BotFather setup
- **Discord** - Server and DM support with slash commands
- **Slack** - Professional team communication (advanced setup)
- **Terminal** - Command-line interface

### 6. Security Hardening (NEW)
- Automatic security configuration (localhost binding, token authentication)
- Secure file permissions (chmod 700)
- Rate limiting and input validation
- Tailscale recommendations for remote access

### 7. Configuration Generation (Enhanced)
- Creates a complete `clawdbot.yaml` configuration file
- Implements security best practices automatically
- Multi-tier provider setup (primary/fallback/onboarding)
- Optimizes settings based on your use case and hardware

### 8. Post-Setup Guide Generation (NEW)
- Creates personalized `OPENCLAW_SETUP_GUIDE.md`
- Channel-specific quick start instructions
- Commands cheatsheet based on experience level
- Troubleshooting guide tailored to your configuration

### 9. Validation & Launch
- Tests API connections and channel configurations
- Validates system requirements and permissions
- Security configuration validation
- Offers to start Clawdbot immediately
- Provides troubleshooting guidance

## 📖 Usage Guide

### Enhanced Setup Flow (v1.1.0)

1. **Welcome & Preferences** - The agent explains OpenClaw and asks about your experience level and intended use
2. **🆕 Subscription Detection** - Intelligent detection of your current AI subscriptions and usage
3. **🆕 System Pre-Check** - Hardware analysis (RAM, disk, GPU) with capability-based recommendations
4. **Environment Scan** - Software environment analysis for compatibility
5. **🆕 Smart Provider Configuration** - AI provider setup with subscription-aware recommendations
6. **Channel Setup** - Configure how you want to interact with your AI assistant  
7. **🆕 Security Hardening** - Automatic application of security best practices
8. **Configuration Generation** - Creates optimized `clawdbot.yaml` file with multi-tier providers
9. **Validation** - Tests all connections and security settings
10. **🆕 Post-Setup Guide** - Generates personalized documentation and next steps
11. **Launch** - Option to start OpenClaw immediately

### Example Session

```bash
$ npx openclaw-setup

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🦾 OpenClaw Setup Agent v1.0.0                 ║
║                                                           ║
║     From zero to working AI assistant in 30 minutes      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Welcome to the OpenClaw Setup Agent! 🦾

OpenClaw (Clawdbot) is an advanced AI assistant framework that lets you:
  • Chat with Claude, GPT, and other AI models via WhatsApp, Telegram, Discord
  • Automate tasks like web browsing, file management, and research
  • Control smart devices and integrate with your workflow
  • Run completely self-hosted for maximum privacy and control

Ready to set up your AI assistant? Yes

🔍 Analyzing your system environment...
✓ Environment analysis complete

🖥️  System Environment

✅ Operating System: macOS 14.2
✅ Architecture: arm64
✅ Node.js: v20.9.0
✅ Package Manager: pnpm

🎉 No issues detected!

🧠 Setting up AI providers...
? Which AI provider would you like to use as your primary? Anthropic Claude (Recommended)
? Enter your Anthropic API key: [hidden]
✓ Anthropic API key validated successfully!

💬 Configuring communication channels...
? Which channels would you like to set up? WhatsApp, Telegram

⚙️ Generating configuration...
✓ Configuration generated successfully

✅ Validating setup...
✓ Configuration validated successfully

🎉 OpenClaw Setup Complete!

Your AI assistant is ready to use.
```

## 🔧 Advanced Configuration

### Environment Variables

You can set these environment variables to customize behavior:

```bash
OPENCLAW_SETUP_DEBUG=true          # Enable debug logging
OPENCLAW_SETUP_CONFIG_PATH=./custom.yaml  # Custom config file path
OPENCLAW_SETUP_SKIP_VALIDATION=true       # Skip API validation (faster setup)
```

### Custom Configuration

The generated `clawdbot.yaml` file is fully customizable. Key sections include:

```yaml
# AI Providers
providers:
  anthropic:
    enabled: true
    apiKey: "sk-ant-..."
    model: "claude-3-5-sonnet-20241022"
    primary: true

# Communication Channels
channels:
  whatsapp:
    enabled: true
    qrTimeout: 60000
    allowGroups: false
  
  telegram:
    enabled: true
    botToken: "123456:ABC-DEF..."
    allowedUsers: ["username1", "username2"]

# Agent Personality
agent:
  name: "OpenClaw Assistant"
  personality: "helpful"
  responseMode: "conversational"
```

## 🐛 Troubleshooting

### Common Issues

**"Node.js version too old"**
```bash
# Install Node.js 18+ using Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**"Cannot access npm registry"**
```bash
# Check proxy settings
npm config get proxy
npm config get https-proxy

# Clear npm cache
npm cache clean --force
```

**"Permission denied for global install"**
```bash
# Use npx instead of global install
npx openclaw-setup

# Or fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**"API key validation failed"**
- Double-check your API key is correct
- Ensure you have sufficient API credits
- Check your internet connection
- Verify the API service is operational

### Getting Help

- 📧 **Email Support**: support@kingos.net
- 📖 **Documentation**: https://kingos.net/docs/openclaw-setup-agent
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/metacrafttech-ltd/openclaw-setup-agent/issues)
- 💬 **Community**: [Discord Server](https://discord.gg/openclaw)

## 🛡️ Security & Privacy

- **API Keys**: Stored locally in your configuration file, never transmitted to our servers
- **Local Processing**: All setup logic runs on your machine
- **No Telemetry**: No usage data is collected or transmitted
- **Open Source**: Full source code available for audit

### Security Best Practices

The agent automatically implements security best practices:

- Restricts file permissions on configuration files
- Implements rate limiting to prevent API abuse
- Validates all user inputs and API responses
- Uses secure defaults for all integrations
- Provides warnings for potentially insecure configurations

## 🚧 Roadmap

### Phase 1: MVP (Current)
- ✅ Core setup automation for macOS/Linux
- ✅ Major AI provider support (Anthropic, OpenAI, OpenRouter, Ollama)
- ✅ Popular channel integrations (WhatsApp, Telegram, Discord)
- ✅ Configuration generation and validation

### Phase 2: Enhancement
- 🔄 Windows/WSL2 support
- 🔄 Advanced channel features (Slack OAuth, custom webhooks)
- 🔄 Team setup and management features
- 🔄 Professional UI/UX improvements

### Phase 3: Enterprise
- ⏳ Enterprise security and compliance features
- ⏳ Multi-tool ecosystem support (Ollama, LocalAI)
- ⏳ Advanced AI and learning capabilities
- ⏳ Global deployment and localization

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and testing requirements
- Submitting pull requests
- Reporting bugs and feature requests

### Development Setup

```bash
# Clone the repository
git clone https://github.com/metacrafttech-ltd/openclaw-setup-agent.git
cd openclaw-setup-agent

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🙏 Acknowledgments

- **OpenClaw Team** - For creating the amazing AI assistant framework
- **Anthropic** - For Claude AI and excellent API documentation
- **King OS Platform** - For supporting this project
- **Contributors** - Everyone who has helped improve this tool

---

**Made with ❤️ by the King OS Platform team**

*Transform your AI setup experience from hours of frustration to minutes of guided automation.*