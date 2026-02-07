/**
 * Channels Flow - Configure communication channels (WhatsApp, Telegram, Discord, etc.)
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Configure communication channels based on user preferences
 */
export async function channelsFlow(environment) {
    console.log('');
    console.log(chalk.white.bold('💬 Communication Channels Setup'));
    console.log(chalk.gray('Choose how you want to interact with your AI assistant.'));
    console.log('');

    // Show available channels
    const channelChoices = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedChannels',
            message: 'Which channels would you like to set up?',
            choices: [
                {
                    name: '📱 WhatsApp - Chat via WhatsApp Web (most popular)',
                    value: 'whatsapp',
                    checked: true
                },
                {
                    name: '📨 Telegram - Fast and reliable bot integration',
                    value: 'telegram'
                },
                {
                    name: '🎮 Discord - Great for communities and servers',
                    value: 'discord'
                },
                {
                    name: '💼 Slack - Professional team communication',
                    value: 'slack'
                },
                {
                    name: '💻 Terminal/CLI - Command line interface only',
                    value: 'terminal'
                }
            ],
            validate(answer) {
                if (answer.length < 1) {
                    return 'Please select at least one communication channel.';
                }
                return true;
            }
        }
    ]);

    const channels = [];
    
    // Configure each selected channel
    for (const channelType of channelChoices.selectedChannels) {
        console.log('');
        console.log(chalk.blue(`📋 Setting up ${getChannelDisplayName(channelType)}...`));
        
        const channelConfig = await configureChannel(channelType, environment);
        if (channelConfig) {
            channels.push(channelConfig);
        }
    }

    return channels;
}

/**
 * Configure a specific channel
 */
async function configureChannel(channelType, environment) {
    switch (channelType) {
        case 'whatsapp':
            return await configureWhatsApp();
        case 'telegram':
            return await configureTelegram();
        case 'discord':
            return await configureDiscord();
        case 'slack':
            return await configureSlack();
        case 'terminal':
            return configureTerminal();
        default:
            console.log(chalk.red(`Unknown channel type: ${channelType}`));
            return null;
    }
}

/**
 * Configure WhatsApp Web integration
 */
async function configureWhatsApp() {
    console.log(chalk.gray('WhatsApp integration uses WhatsApp Web to send and receive messages.'));
    console.log(chalk.gray('You\'ll need to scan a QR code with your phone to connect.'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'enableWhatsApp',
            message: 'Enable WhatsApp integration?',
            default: true
        }
    ]);

    if (!answers.enableWhatsApp) {
        return null;
    }

    // Advanced WhatsApp configuration
    const advanced = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'showAdvanced',
            message: 'Configure advanced WhatsApp settings?',
            default: false
        }
    ]);

    let config = {
        name: 'whatsapp',
        type: 'whatsapp',
        enabled: true,
        settings: {
            autoQRDisplay: true,
            messageLogging: true,
            allowGroups: false
        }
    };

    if (advanced.showAdvanced) {
        const advancedSettings = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'allowGroups',
                message: 'Allow the AI to respond in WhatsApp groups?',
                default: false
            },
            {
                type: 'list',
                name: 'responseMode',
                message: 'How should the AI respond to messages?',
                choices: [
                    { name: 'Always respond to direct messages', value: 'always' },
                    { name: 'Only respond when mentioned with @', value: 'mention' },
                    { name: 'Manual approval for each message', value: 'manual' }
                ],
                default: 'always'
            },
            {
                type: 'input',
                name: 'allowedContacts',
                message: 'Allowed phone numbers (comma-separated, leave empty for all):',
                filter: (input) => {
                    if (!input.trim()) return [];
                    return input.split(',').map(num => num.trim()).filter(num => num);
                }
            }
        ]);

        config.settings = {
            ...config.settings,
            allowGroups: advancedSettings.allowGroups,
            responseMode: advancedSettings.responseMode,
            allowedContacts: advancedSettings.allowedContacts
        };
    }

    console.log(chalk.green('✅ WhatsApp configuration ready!'));
    console.log(chalk.gray('📝 You\'ll scan the QR code when OpenClaw starts for the first time.'));

    return config;
}

/**
 * Configure Telegram bot
 */
async function configureTelegram() {
    console.log(chalk.gray('Telegram integration requires creating a bot with @BotFather.'));
    console.log(chalk.gray('Visit https://t.me/botfather to create your bot and get a token.'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'hasBotToken',
            message: 'Do you already have a Telegram bot token?',
            default: false
        }
    ]);

    if (!answers.hasBotToken) {
        console.log(chalk.yellow('📱 To get a Telegram bot token:'));
        console.log(chalk.white('1. Open Telegram and search for @BotFather'));
        console.log(chalk.white('2. Send /newbot and follow the instructions'));
        console.log(chalk.white('3. Choose a name and username for your bot'));
        console.log(chalk.white('4. Copy the bot token that BotFather gives you'));
        console.log('');

        const { continueSetup } = await inquirer.prompt([{
            type: 'confirm',
            name: 'continueSetup',
            message: 'Have you created your bot and got the token?',
            default: false
        }]);

        if (!continueSetup) {
            console.log(chalk.yellow('⏭️  Skipping Telegram setup. You can add it later.'));
            return null;
        }
    }

    const tokenInput = await inquirer.prompt([
        {
            type: 'password',
            name: 'botToken',
            message: 'Enter your Telegram bot token:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'Bot token is required';
                if (!input.match(/^\d+:[A-Za-z0-9_-]+$/)) {
                    return 'Invalid bot token format. Should be like "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'allowedUsers',
            message: 'Allowed Telegram usernames (comma-separated, leave empty for all):',
            filter: (input) => {
                if (!input.trim()) return [];
                return input.split(',').map(user => user.trim().replace('@', '')).filter(user => user);
            }
        }
    ]);

    console.log(chalk.green('✅ Telegram bot configuration ready!'));
    
    return {
        name: 'telegram',
        type: 'telegram',
        enabled: true,
        settings: {
            botToken: tokenInput.botToken,
            allowedUsers: tokenInput.allowedUsers,
            commandPrefix: '/'
        }
    };
}

/**
 * Configure Discord bot
 */
async function configureDiscord() {
    console.log(chalk.gray('Discord integration requires creating a bot application.'));
    console.log(chalk.gray('Visit https://discord.com/developers/applications to create your bot.'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'hasBotToken',
            message: 'Do you already have a Discord bot token?',
            default: false
        }
    ]);

    if (!answers.hasBotToken) {
        console.log(chalk.yellow('🎮 To create a Discord bot:'));
        console.log(chalk.white('1. Go to https://discord.com/developers/applications'));
        console.log(chalk.white('2. Click "New Application" and give it a name'));
        console.log(chalk.white('3. Go to "Bot" section and click "Add Bot"'));
        console.log(chalk.white('4. Copy the bot token (click "Copy" under Token)'));
        console.log(chalk.white('5. Under "Privileged Gateway Intents", enable "Message Content Intent"'));
        console.log('');

        const { continueSetup } = await inquirer.prompt([{
            type: 'confirm',
            name: 'continueSetup',
            message: 'Have you created your Discord bot and got the token?',
            default: false
        }]);

        if (!continueSetup) {
            console.log(chalk.yellow('⏭️  Skipping Discord setup. You can add it later.'));
            return null;
        }
    }

    const botConfig = await inquirer.prompt([
        {
            type: 'password',
            name: 'botToken',
            message: 'Enter your Discord bot token:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'Bot token is required';
                if (input.length < 50) return 'Discord bot tokens are usually longer than 50 characters';
                return true;
            }
        },
        {
            type: 'input',
            name: 'guildId',
            message: 'Discord server (guild) ID (leave empty to work in DMs only):',
            validate: (input) => {
                if (input && !/^\d+$/.test(input)) {
                    return 'Guild ID should be numeric';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'commandPrefix',
            message: 'Command prefix for bot commands:',
            default: '!',
            validate: (input) => input ? true : 'Prefix is required'
        }
    ]);

    console.log(chalk.green('✅ Discord bot configuration ready!'));
    console.log(chalk.gray('📝 Remember to invite your bot to your Discord server with appropriate permissions.'));

    return {
        name: 'discord',
        type: 'discord',
        enabled: true,
        settings: {
            botToken: botConfig.botToken,
            guildId: botConfig.guildId || null,
            commandPrefix: botConfig.commandPrefix,
            intents: ['GUILD_MESSAGES', 'DIRECT_MESSAGES', 'MESSAGE_CONTENT']
        }
    };
}

/**
 * Configure Slack integration
 */
async function configureSlack() {
    console.log(chalk.gray('Slack integration requires creating a Slack app.'));
    console.log(chalk.gray('This is more complex - we recommend starting with other channels first.'));
    console.log('');

    const { continueSlack } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'continueSlack',
            message: 'Continue with Slack setup? (Advanced users only)',
            default: false
        }
    ]);

    if (!continueSlack) {
        console.log(chalk.yellow('⏭️  Skipping Slack setup. You can add it later.'));
        return null;
    }

    console.log(chalk.yellow('🔧 Slack setup requires multiple tokens and OAuth configuration.'));
    console.log(chalk.yellow('For now, we\'ll create a basic configuration that you can complete later.'));

    return {
        name: 'slack',
        type: 'slack',
        enabled: false,
        settings: {
            // These will need to be configured manually
            botToken: 'xoxb-your-bot-token',
            appToken: 'xapp-your-app-token',
            signingSecret: 'your-signing-secret',
            note: 'Complete this configuration in clawdbot.yaml after creating your Slack app'
        }
    };
}

/**
 * Configure terminal/CLI interface
 */
function configureTerminal() {
    console.log(chalk.gray('Terminal interface allows you to chat with your AI directly from the command line.'));
    console.log(chalk.green('✅ Terminal interface is always available - no additional configuration needed!'));

    return {
        name: 'terminal',
        type: 'terminal',
        enabled: true,
        settings: {
            prompt: 'openclaw>',
            historySize: 1000,
            autoComplete: true
        }
    };
}

/**
 * Get display name for channel type
 */
function getChannelDisplayName(channelType) {
    switch (channelType) {
        case 'whatsapp': return 'WhatsApp';
        case 'telegram': return 'Telegram';
        case 'discord': return 'Discord';
        case 'slack': return 'Slack';
        case 'terminal': return 'Terminal/CLI';
        default: return channelType;
    }
}