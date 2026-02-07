# Privacy Policy

**Last updated:** February 2026

## Overview

OpenClaw Setup Agent is a local-first tool that respects your privacy. We do not collect, store, or transmit any personal data.

## What We Collect

**Nothing.**

- No telemetry
- No analytics
- No usage tracking
- No crash reports sent to us

## What Stays on Your Machine

All data remains on your local machine:

- **API Keys**: Stored only in your local `clawdbot.yaml` configuration file
- **Configuration**: Written to your local filesystem only
- **Chat History**: Managed by your local OpenClaw installation
- **System Information**: Environment analysis runs locally and is never transmitted

## Third-Party Services

When you configure AI providers, your data flows directly between your machine and those providers:

| Provider | Their Privacy Policy |
|----------|---------------------|
| Anthropic | https://www.anthropic.com/privacy |
| OpenAI | https://openai.com/privacy |
| OpenRouter | https://openrouter.ai/privacy |

We have no visibility into your API usage or conversations with these providers.

## Communication Channels

When you configure channels (WhatsApp, Telegram, Discord, Slack):

- Authentication tokens are stored locally in your configuration
- Messages flow directly between your machine and the respective platforms
- We do not proxy, intercept, or store any messages

## Data Security

You are responsible for:

- Securing your local machine
- Protecting your `clawdbot.yaml` file (contains API keys)
- Managing access to your OpenClaw installation

We recommend:

- Setting appropriate file permissions (`chmod 600 clawdbot.yaml`)
- Using environment variables for sensitive keys in production
- Not committing configuration files to public repositories

## Children's Privacy

This software is not intended for use by children under 13. We do not knowingly collect any data from anyone, including children.

## Changes to This Policy

We may update this policy occasionally. Check the "Last updated" date above.

## Contact

For privacy questions:
- Email: king@metacrafttech.com
- GitHub: https://github.com/MetacraftTech-Ltd/openclaw-setup-agent/issues

## Summary

**We collect nothing. Everything stays on your machine. Your privacy is yours.**
