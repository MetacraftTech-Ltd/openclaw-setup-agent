/**
 * Post-Setup Guide Generator - Generate personalized guides after successful setup
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Generate comprehensive post-setup guide based on user configuration
 */
export function generatePostSetupGuide(config, userPreferences, setupResults) {
    const guide = {
        introduction: generateIntroduction(config),
        quickStart: generateQuickStart(config, userPreferences),
        channels: generateChannelGuide(config.channels),
        commands: generateCommandsCheatsheet(config, userPreferences),
        troubleshooting: generateTroubleshooting(config),
        nextSteps: generateNextSteps(userPreferences, setupResults),
        resources: generateResources()
    };

    return guide;
}

/**
 * Generate introduction section
 */
function generateIntroduction(config) {
    const providerNames = config.providers
        ?.filter(p => p.enabled)
        ?.map(p => p.displayName || p.name)
        ?.join(', ') || 'AI providers';
    
    const channelNames = Object.keys(config.channels || {})
        .filter(channel => config.channels[channel].enabled)
        .join(', ');

    return `🎉 **Your OpenClaw AI Assistant is Ready!**

Congratulations! Your AI assistant has been successfully configured and is ready to help you with tasks, answer questions, and automate your workflow.

**Your Setup:**
• AI Providers: ${providerNames}
• Communication Channels: ${channelNames}
• Gateway: Running on localhost (secure by default)

Your AI assistant can help with:
• Answering questions and research
• File management and organization  
• Web browsing and data extraction
• Task automation and reminders
• Creative writing and analysis
• Code review and debugging

Let's get you started with the basics!`;
}

/**
 * Generate quick start section
 */
function generateQuickStart(config, userPreferences) {
    const quickStart = [
        '## 🚀 Quick Start\n',
        '### 1. Start Your AI Assistant',
        '```bash',
        'clawdbot gateway start',
        '```\n',
        '### 2. Connect Your First Channel'
    ];

    // Add channel-specific quick start
    const enabledChannels = Object.keys(config.channels || {})
        .filter(channel => config.channels[channel].enabled);

    enabledChannels.forEach(channel => {
        switch (channel) {
            case 'whatsapp':
                quickStart.push(
                    '**WhatsApp:**',
                    '1. Open WhatsApp Web in your browser',
                    '2. Scan the QR code that appears in your terminal',
                    '3. Send "Hello" to test the connection\n'
                );
                break;
            case 'telegram':
                quickStart.push(
                    '**Telegram:**',
                    '1. Start a chat with your bot',
                    '2. Send /start to begin',
                    '3. Try asking "What can you do?"\n'
                );
                break;
            case 'discord':
                quickStart.push(
                    '**Discord:**',
                    '1. Invite the bot to your server',
                    '2. Use /help to see available commands',
                    '3. Try a direct message to the bot\n'
                );
                break;
        }
    });

    quickStart.push(
        '### 3. Your First Conversation',
        'Try these starter prompts:',
        '• "Help me organize my desktop files"',
        '• "What\'s the weather like today?"',
        '• "Summarize the latest tech news"',
        '• "Create a todo list for tomorrow"'
    );

    return quickStart.join('\n');
}

/**
 * Generate channel-specific guide
 */
function generateChannelGuide(channels) {
    if (!channels) return '';

    let guide = '## 💬 Channel Setup Details\n';

    Object.keys(channels).forEach(channelType => {
        const channel = channels[channelType];
        if (!channel.enabled) return;

        switch (channelType) {
            case 'whatsapp':
                guide += `
### WhatsApp
• **Connection:** QR code pairing (secure)
• **Features:** Text, images, voice messages, file sharing
• **Tips:** 
  - Works with WhatsApp Web
  - Can handle group chats if enabled
  - Voice messages are transcribed automatically
  - Send images for analysis and description\n`;
                break;

            case 'telegram':
                guide += `
### Telegram  
• **Bot Username:** @${channel.botUsername || 'your-bot'}
• **Features:** Text, images, documents, inline keyboards
• **Commands:**
  - /start - Initialize the bot
  - /help - Get help and commands
  - /settings - Adjust bot preferences
• **Tips:**
  - Use inline queries: @bot_name your question
  - Create groups and add the bot for team collaboration
  - Forward messages for context sharing\n`;
                break;

            case 'discord':
                guide += `
### Discord
• **Features:** Slash commands, text channels, DMs
• **Commands:**
  - /help - Bot capabilities
  - /ask - Direct question
  - /web - Web search and analysis
• **Tips:**
  - Use @bot-name for mentions
  - Create dedicated AI channel for team use
  - Bot can join voice channels for transcription\n`;
                break;

            case 'slack':
                guide += `
### Slack
• **Integration:** OAuth app or bot token
• **Features:** Channels, DMs, threads, file sharing
• **Commands:**
  - @assistant help - Get started
  - /ai ask question - Quick questions
• **Tips:**
  - Use threads for longer conversations
  - Share files for analysis
  - Set up daily digest channels\n`;
                break;
        }
    });

    return guide;
}

/**
 * Generate commands cheatsheet
 */
function generateCommandsCheatsheet(config, userPreferences) {
    let cheatsheet = '## 📝 Commands Cheatsheet\n';

    // Basic commands for all users
    cheatsheet += `
### Basic Commands
• **"Help"** - Get assistance and available commands
• **"What can you do?"** - Learn about capabilities
• **"Search [topic]"** - Web search and research
• **"Summarize [text/url]"** - Summarize content
• **"Remember [note]"** - Add to memory

### File Management
• **"List files in [folder]"** - Browse directories
• **"Organize my downloads"** - Clean up downloads folder
• **"Find files containing [text]"** - Search file contents
• **"Backup [folder] to [location]"** - Create backups

### Productivity  
• **"Create todo list"** - Task management
• **"Set reminder for [time]"** - Schedule reminders
• **"Calendar for this week"** - Check schedule
• **"Email summary"** - Check unread emails`;

    // Add experience-specific commands
    if (userPreferences.experience === 'advanced') {
        cheatsheet += `
### Advanced Commands
• **"Run command: [shell command]"** - Execute system commands
• **"Deploy to [service]"** - Application deployment
• **"Monitor [service/log]"** - System monitoring
• **"Backup database"** - Database operations
• **"Git status"** - Version control operations`;
    }

    // Add use-case specific commands
    switch (userPreferences.primaryUse) {
        case 'work':
            cheatsheet += `
### Work & Business
• **"Schedule meeting with [person]"** - Calendar management
• **"Draft email to [recipient] about [topic]"** - Email composition
• **"Analyze this spreadsheet"** - Data analysis
• **"Generate report on [topic]"** - Business reporting
• **"Convert [file] to PDF"** - Document processing`;
            break;

        case 'automation':
            cheatsheet += `
### Automation & Development
• **"Create script for [task]"** - Code generation
• **"Deploy to staging"** - Deployment automation
• **"Run tests"** - Test execution
• **"Monitor server health"** - Infrastructure monitoring
• **"Generate API docs"** - Documentation automation`;
            break;

        case 'personal':
            cheatsheet += `
### Personal Assistant
• **"Weather for tomorrow"** - Weather updates
• **"News headlines"** - News briefing
• **"Recipe for [dish]"** - Cooking assistance
• **"Directions to [location]"** - Navigation help
• **"Track package [number]"** - Delivery tracking`;
            break;
    }

    return cheatsheet;
}

/**
 * Generate troubleshooting section
 */
function generateTroubleshooting(config) {
    return `## 🔧 Troubleshooting

### Common Issues

**"Bot not responding"**
1. Check if gateway is running: \`clawdbot gateway status\`
2. Restart gateway: \`clawdbot gateway restart\`
3. Check logs: \`clawdbot gateway logs\`

**"API errors or quota exceeded"**
1. Check API key validity in configuration
2. Verify API quota and billing
3. Try switching to fallback provider if configured

**"Channel connection failed"**
1. Verify channel tokens and credentials
2. Check network connectivity
3. Review channel-specific setup instructions

**"Slow responses"**
1. Check internet connection speed
2. Try different AI provider if available
3. Reduce complexity of requests

### Performance Optimization
• Use faster models for simple tasks
• Enable caching for repeated queries
• Configure proper rate limits
• Monitor resource usage

### Getting Help
• Check logs: \`clawdbot gateway logs --level debug\`
• Visit documentation: https://kingos.net/docs/openclaw
• Community support: https://discord.gg/openclaw
• Email support: support@kingos.net`;
}

/**
 * Generate next steps recommendations
 */
function generateNextSteps(userPreferences, setupResults) {
    const steps = ['## 🎯 Recommended Next Steps\n'];

    // Immediate next steps
    steps.push('### Immediate (Next 24 Hours)');
    steps.push('1. **Test Basic Functionality**');
    steps.push('   - Send a simple message to verify response');
    steps.push('   - Try file listing or web search');
    steps.push('   - Test voice/image features if available\n');

    steps.push('2. **Customize Your Assistant**');
    steps.push('   - Set your preferences and timezone');
    steps.push('   - Configure notification schedules');
    steps.push('   - Add personal context to memory\n');

    // Experience-based recommendations
    if (userPreferences.experience === 'beginner') {
        steps.push('### This Week - Learn the Basics');
        steps.push('• Practice with simple commands daily');
        steps.push('• Read the user guide thoroughly');
        steps.push('• Join beginner tutorials or webinars');
        steps.push('• Start with text-only interactions\n');
    } else if (userPreferences.experience === 'advanced') {
        steps.push('### This Week - Advanced Setup');
        steps.push('• Configure automation workflows');
        steps.push('• Set up monitoring and alerts');
        steps.push('• Integrate with existing tools');
        steps.push('• Customize agent behaviors\n');
    }

    // Use case specific recommendations
    switch (userPreferences.primaryUse) {
        case 'work':
            steps.push('### Professional Integration');
            steps.push('• Connect calendar and email');
            steps.push('• Set up team collaboration features');
            steps.push('• Configure business-specific skills');
            steps.push('• Establish security protocols\n');
            break;
        case 'automation':
            steps.push('### Automation Opportunities');
            steps.push('• Identify repetitive tasks to automate');
            steps.push('• Create custom workflows');
            steps.push('• Set up monitoring dashboards');
            steps.push('• Build integration scripts\n');
            break;
        case 'personal':
            steps.push('### Personal Optimization');
            steps.push('• Set up daily routines and reminders');
            steps.push('• Configure smart home integrations');
            steps.push('• Create personal information database');
            steps.push('• Establish regular interaction patterns\n');
            break;
    }

    steps.push('### Long-term Goals');
    steps.push('• **Month 1:** Master basic features and daily usage');
    steps.push('• **Month 2:** Explore advanced capabilities and automation');
    steps.push('• **Month 3:** Optimize workflows and add integrations');
    steps.push('• **Ongoing:** Stay updated with new features and models');

    return steps.join('\n');
}

/**
 * Generate resources section
 */
function generateResources() {
    return `## 📚 Resources & Learning

### Documentation
• **Official Docs:** https://kingos.net/docs/openclaw
• **API Reference:** https://kingos.net/docs/api
• **Configuration Guide:** https://kingos.net/docs/config
• **Security Guide:** https://kingos.net/docs/security

### Community
• **Discord Community:** https://discord.gg/openclaw
• **GitHub Repository:** https://github.com/anthropics/clawdbot
• **Discussion Forum:** https://community.kingos.net
• **YouTube Tutorials:** https://youtube.com/@kingos

### Support
• **Email Support:** support@kingos.net
• **Bug Reports:** https://github.com/metacrafttech-ltd/openclaw-setup-agent/issues
• **Feature Requests:** https://community.kingos.net/feature-requests

### Updates
• **Release Notes:** https://kingos.net/releases
• **Upgrade Guide:** https://kingos.net/docs/upgrades
• **Security Advisories:** https://kingos.net/security

### Advanced Topics
• **Custom Skills Development:** https://kingos.net/docs/skills
• **Integration Patterns:** https://kingos.net/docs/integrations
• **Performance Tuning:** https://kingos.net/docs/performance
• **Enterprise Deployment:** https://kingos.net/docs/enterprise`;
}

/**
 * Write post-setup guide to file
 */
export function writePostSetupGuide(guide, outputPath) {
    const content = [
        '# OpenClaw Post-Setup Guide',
        `*Generated on ${new Date().toLocaleDateString()}*\n`,
        guide.introduction,
        guide.quickStart,
        guide.channels,
        guide.commands,
        guide.troubleshooting,
        guide.nextSteps,
        guide.resources
    ].join('\n\n');

    try {
        fs.writeFileSync(outputPath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to write post-setup guide:'), error.message);
        return false;
    }
}

/**
 * Display post-setup guide summary
 */
export function displayPostSetupSummary(guide, guidePath) {
    console.log(chalk.green.bold('\n🎉 Setup Complete! Your AI assistant is ready.\n'));

    console.log(chalk.cyan('Quick Start:'));
    console.log(chalk.white('1. Run: clawdbot gateway start'));
    console.log(chalk.white('2. Connect your channels (follow QR codes or bot tokens)'));
    console.log(chalk.white('3. Send your first message: "Hello, what can you do?"'));
    console.log('');

    if (guidePath) {
        console.log(chalk.blue(`📖 Complete guide saved to: ${guidePath}`));
        console.log(chalk.gray('   Open this file for detailed instructions and tips'));
        console.log('');
    }

    console.log(chalk.yellow('Next Steps:'));
    console.log(chalk.white('• Test basic functionality today'));
    console.log(chalk.white('• Explore advanced features this week'));
    console.log(chalk.white('• Join our community for tips and support'));
    console.log('');

    console.log(chalk.magenta('Need Help?'));
    console.log(chalk.white('• Documentation: https://kingos.net/docs/openclaw'));
    console.log(chalk.white('• Discord: https://discord.gg/openclaw'));
    console.log(chalk.white('• Email: support@kingos.net'));
    console.log('');

    console.log(chalk.gray('Thank you for choosing OpenClaw! 🦾'));
}