# OC-001: OpenClaw vs Clawdbot 2026.1.24 — Gap Analysis

**Author:** Divine (✨)  
**Sprint:** 16  
**Date:** 2026-02-20  
**OpenClaw Version:** 1.1.0-beta.1  
**Clawdbot Version:** 2026.1.24-3  

---

## Summary

OpenClaw Setup Agent was built targeting Clawdbot ~2026.1.22. The current Clawdbot (2026.1.24-3) has added significant features that OpenClaw doesn't leverage, and some config patterns have changed. This document maps the gaps.

---

## New Clawdbot Features (Not in OpenClaw)

### HIGH PRIORITY — Should Add to Setup

| Feature | Clawdbot Version | Impact | Action |
|---|---|---|---|
| **Edge TTS fallback (keyless)** | 2026.1.24 | Free TTS without API key — eliminates ElevenLabs dependency for basic use | Add Edge TTS as default TTS in setup flow |
| **TTS auto modes** (off/always/inbound/tagged) | 2026.1.24 | Users can control when TTS fires | Add TTS mode selection to setup |
| **Exec approvals via /approve** | 2026.1.24 | Safer exec — users approve dangerous commands in-chat | Document in post-setup guide |
| **Config.patch (gateway tool)** | 2026.1.24 | Safe partial config updates without full rewrite | Use in setup for incremental config |
| **LINE channel plugin** | 2026.1.24 | New messaging channel | Add to channel selection flow |
| **Ollama discovery** | 2026.1.24 | Auto-detect local Ollama models | Enhance local model detection |

### MEDIUM PRIORITY — Nice to Have

| Feature | Clawdbot Version | Impact | Action |
|---|---|---|---|
| **Diagnostic flags** | 2026.1.24 | Debug logging for troubleshooting | Add to troubleshooting guide |
| **Brave freshness filter** | 2026.1.24 | Time-scoped web search | Mention in capabilities doc |
| **Telegram DM topics** | 2026.1.24 | Separate sessions per topic | Update Telegram setup notes |
| **Web UI refresh** | 2026.1.24 | Better Control UI | Update screenshots in guide |
| **Link understanding skip** | 2026.1.24 | Don't double-process images | Config optimization note |

### LOW PRIORITY — Awareness Only

| Feature | Clawdbot Version | Impact |
|---|---|---|
| Matrix E2EE media | 2026.1.24 | Niche channel |
| BlueBubbles improvements | 2026.1.24 | iMessage relay |
| Fly.io deployment | 2026.1.23 | Alternative hosting |
| Tools invoke HTTP API | 2026.1.23 | Advanced API use |

---

## Config Schema Changes

### New Config Fields (2026.1.24)

```yaml
# TTS — new auto modes
messages:
  tts:
    auto: "off" | "always" | "inbound" | "tagged"  # NEW — was boolean
    provider: "edge" | "elevenlabs" | "google" | "openai"  # edge is new default

# Telegram — new options
channels:
  telegram:
    linkPreview: true | false  # NEW
    # DM topics now create separate sessions automatically

# Gateway — new control UI auth
gateway:
  controlUi:
    allowInsecureAuth: true | false  # NEW

# Diagnostics — new flags
diagnostics:
  flags: []  # NEW — array of debug flags
```

### Breaking Changes

None found between 2026.1.22 and 2026.1.24. Config is backward compatible.

---

## OpenClaw Setup Flow — Gaps

### 1. Subscription Detection (Step 2) ✅ Good
- Already detects ChatGPT, Claude, OpenRouter
- **Gap:** Doesn't mention Edge TTS as free alternative to ElevenLabs
- **Fix:** Add "No TTS subscription needed — free Edge TTS available" to flow

### 2. System Pre-Check (Step 3) ✅ Good  
- Hardware detection works
- **Gap:** Doesn't check for Ollama installation (Clawdbot now auto-discovers)
- **Fix:** Add `which ollama` check, if found → offer local model config

### 3. Provider Setup (Step 4) ⚠️ Needs Update
- **Gap:** Free model list outdated. Kimi K2.5 via Nvidia is still valid.
- **Gap:** No mention of Edge TTS as zero-cost TTS option
- **Fix:** Update free model recommendations, add TTS provider selection

### 4. Channel Setup (Step 5) ⚠️ Needs Update
- **Gap:** Missing LINE channel option
- **Gap:** Telegram setup doesn't mention DM topic behavior
- **Fix:** Add LINE to channel list, update Telegram notes

### 5. Config Generation (Step 6) ⚠️ Needs Update
- **Gap:** TTS config uses old boolean format instead of new auto modes
- **Gap:** Doesn't generate Edge TTS config by default
- **Fix:** Update config generator for new TTS schema

### 6. Security Hardening (Step 7) ✅ Good
- Already applies localhost binding
- Already sets secure permissions
- **Gap:** Doesn't mention /approve exec approval workflow
- **Fix:** Add note about exec approvals in post-setup guide

### 7. Post-Setup Guide (Step 8) ⚠️ Needs Update
- **Gap:** Doesn't mention diagnostic flags for troubleshooting
- **Gap:** Doesn't reference Control UI changes
- **Fix:** Update guide with diagnostic tips and new UI screenshots

---

## Manual Steps Still Required (Known Issues)

These are steps that OpenClaw can't automate and must be documented:

1. **Anthropic API key creation** — requires human account + payment method
2. **WhatsApp Business API** — requires Meta business verification (weeks)
3. **Telegram bot creation** — requires @BotFather interaction
4. **Discord bot creation** — requires Discord Developer Portal
5. **Slack app creation** — requires Slack workspace admin
6. **Domain setup** — DNS, SSL certificates
7. **Tailscale** — requires account creation + device auth
8. **Cloud deployment** — VPS creation, SSH key setup

**Improvement:** Create video walkthroughs for each manual step. Link from post-setup guide.

---

## Rob's Installation Experience (Known Pain Points)

Based on beta tester context:
- Rob Mbah is already running current OpenClaw version
- Key friction points to investigate with Rob:
  - First-run experience (was anything confusing?)
  - Config generation accuracy (did it produce a working config?)
  - Channel setup (which channels, any issues?)
  - What they wish they knew before starting

**Action:** Create a feedback questionnaire and send to Rob + all beta testers.

---

## Recommended Changes for v1.2.0

### Must Do (OC-002 scope)
1. Update TTS config generation for Edge TTS (free default)
2. Update TTS auto mode (off/always/inbound/tagged)
3. Add Ollama auto-discovery in system pre-check
4. Add LINE to channel selection
5. Update post-setup guide with diagnostic flags

### Should Do (OC-003 scope)
6. Create beta tester feedback questionnaire
7. Add video walkthrough links for manual steps
8. Update free model recommendations
9. Add /approve exec workflow documentation
10. Test full setup flow against Clawdbot 2026.1.24-3

### Package Updates (OC-003 scope)
11. Version bump to 1.2.0
12. Update README with current Clawdbot version
13. Update CHANGELOG
14. Test and publish to npm

---

*This gap analysis feeds directly into OC-002 (rebuild setup flow) and OC-003 (package for release).*
