# OpenClaw Setup Agent - Test Script

## How to Run Tests (as Kaidon user)

```bash
# Navigate to any directory (doesn't matter where)
cd ~

# Run the setup agent
npx openclaw-setup
```

---

## Test Flow Checklist

### Stage 1: Welcome Screen ✓/✗

**Expected:**
- [ ] ASCII art banner shows "🦾 OpenClaw Setup Agent v1.0.0"
- [ ] Subtitle: "From zero to working AI assistant in 30 minutes"
- [ ] Prompt: "Ready to set up your AI assistant?" (Y/n)

**Test:**
- [ ] Press `Y` or Enter → should proceed
- [ ] Press `n` → should exit gracefully with message

---

### Stage 2: Environment Analysis ✓/✗

**Expected:**
- [ ] Spinner shows "Scanning system configuration"
- [ ] Green box displays:
  - Operating System (darwin 25.x.x for Mac)
  - Architecture (arm64 for M-series Mac)
  - Node.js version (v22.x.x)
  - Package Manager (npm/pnpm)
- [ ] "No issues detected!" or lists warnings

**Verify:**
- [ ] Info matches actual system (`node -v`, `uname -a`)

---

### Stage 3: AI Provider Setup ✓/✗

**Prompt:** "Which AI provider would you like to use as your primary?"

**Options to test:**
1. **Anthropic Claude** (Recommended)
   - [ ] Asks for API key
   - [ ] Validates key format (must start with `sk-ant-`)
   - [ ] Tests API connection
   - [ ] Shows ✓ success or ✗ failure

2. **OpenAI GPT**
   - [ ] Asks for API key  
   - [ ] Validates key format (must start with `sk-`)
   - [ ] Tests API connection

3. **OpenRouter**
   - [ ] Asks for API key
   - [ ] Validates connection

4. **Local Ollama**
   - [ ] Checks if Ollama is installed/running
   - [ ] Lists available models

**After primary:**
- [ ] Asks "Add additional providers for backup?" (Y/n)

---

### Stage 4: Channel Setup ✓/✗

**Prompt:** "Which channels would you like to set up?"

**Options (multi-select):**
- [ ] WhatsApp
- [ ] Telegram
- [ ] Discord
- [ ] Slack
- [ ] Terminal (always included)

**For WhatsApp:**
- [ ] Shows QR code in terminal
- [ ] Waits for phone scan
- [ ] Confirms pairing success

**For Telegram:**
- [ ] Asks for BotFather token
- [ ] Validates token format
- [ ] Tests bot connection

**For Discord:**
- [ ] Asks for bot token
- [ ] Asks for server ID (optional)
- [ ] Validates connection

**For Slack:**
- [ ] More complex OAuth flow (test separately)

---

### Stage 5: Configuration Generation ✓/✗

**Expected:**
- [ ] Spinner shows "Creating clawdbot.yaml"
- [ ] Creates file at `./clawdbot.yaml`
- [ ] Shows "Configuration generated successfully"

**Verify:**
```bash
cat clawdbot.yaml
# Should contain providers/channels you configured
```

---

### Stage 6: Validation ✓/✗

**Expected:**
- [ ] Spinner shows "Testing configuration"
- [ ] Tests each provider API
- [ ] Tests each channel connection
- [ ] Shows ✓ all valid OR lists errors

**If errors:**
- [ ] Shows list of issues
- [ ] Asks "Continue anyway?" (y/N)

---

### Stage 7: Finalize & Launch ✓/✗

**Expected:**
- [ ] Shows configuration summary
- [ ] Asks "Start Clawdbot now?" (Y/n)
- [ ] If yes: runs `clawdbot gateway start`
- [ ] Shows success banner with next steps

---

## Navigation Keys

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate options |
| Space | Select/deselect (multi-select) |
| Enter | Confirm selection |
| Ctrl+C | Exit setup completely |

**⚠️ Currently no "go back" feature** — if you need to change a previous answer, press `Ctrl+C` and restart. This is a known limitation (adding to backlog).

---

## Error Scenarios to Test

1. **Invalid API key**
   - [ ] Enter wrong key format → should show validation error
   - [ ] Enter valid format but wrong key → should fail API test

2. **No internet**
   - [ ] Disconnect wifi → should fail API validation gracefully

3. **Existing clawdbot.yaml**
   - [ ] Run in folder with existing config → should ask to overwrite

4. **Cancel mid-setup**
   - [ ] Press Ctrl+C at any stage → should exit cleanly

---

## Quick Validation Commands

After setup completes, verify:

```bash
# Check config was created
ls -la clawdbot.yaml

# View config (check your providers/channels)
cat clawdbot.yaml

# Test gateway starts
clawdbot gateway start

# Check status
clawdbot gateway status

# Stop when done testing
clawdbot gateway stop
```

---

## Report Format

After testing, report:
```
Stage 1 (Welcome): ✓ Pass / ✗ Fail - [notes]
Stage 2 (Environment): ✓ Pass / ✗ Fail - [notes]
Stage 3 (Providers): ✓ Pass / ✗ Fail - [notes]
Stage 4 (Channels): ✓ Pass / ✗ Fail - [notes]
Stage 5 (Config Gen): ✓ Pass / ✗ Fail - [notes]
Stage 6 (Validation): ✓ Pass / ✗ Fail - [notes]
Stage 7 (Finalize): ✓ Pass / ✗ Fail - [notes]
```
