/**
 * Finalization Flow - Complete setup and offer to start Clawdbot
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Finalize the setup and offer to start Clawdbot
 */
export async function finalizeSetup(config, validation) {
    console.log('');
    console.log(chalk.green.bold('🎉 Configuration Complete!'));
    console.log('');
    
    // Show configuration summary
    displayConfigurationSummary(config);
    
    // Ask if they want to start Clawdbot now
    const { startNow } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'startNow',
            message: 'Would you like to start Clawdbot now?',
            default: true
        }
    ]);
    
    if (startNow) {
        await startClawdbot(config);
    } else {
        showManualInstructions(config);
    }
    
    // Offer additional resources
    await offerAdditionalResources();
}

/**
 * Display a summary of the configuration
 */
function displayConfigurationSummary(config) {
    console.log(chalk.blue.bold('📋 Configuration Summary:'));
    console.log('');
    
    // AI Providers
    console.log(chalk.white.bold('🧠 AI Providers:'));
    config.providers.forEach(provider => {
        const indicator = provider.isPrimary ? chalk.green('●') : chalk.gray('○');
        console.log(`   ${indicator} ${provider.displayName || provider.name} (${provider.model})`);
    });
    console.log('');
    
    // Communication Channels
    console.log(chalk.white.bold('💬 Channels:'));
    config.channels.forEach(channel => {
        const status = channel.enabled ? chalk.green('✓') : chalk.gray('○');
        console.log(`   ${status} ${getChannelDisplayName(channel.type)}`);
    });
    console.log('');
    
    // Configuration file location
    console.log(chalk.white.bold('⚙️  Configuration:'));
    console.log(`   📄 Config file: ${chalk.cyan('./clawdbot.yaml')}`);
    console.log(`   📁 Working directory: ${chalk.cyan(process.cwd())}`);
    console.log('');
}

/**
 * Attempt to start Clawdbot
 */
async function startClawdbot(config) {
    console.log(chalk.blue('🚀 Starting Clawdbot...'));
    console.log('');
    
    try {
        // Check if OpenClaw/Clawdbot is installed
        let clawdbotCommand = 'clawdbot';
        
        try {
            execSync('which clawdbot', { stdio: 'pipe' });
        } catch (error) {
            // Try npx
            try {
                execSync('which npx', { stdio: 'pipe' });
                clawdbotCommand = 'npx clawdbot';
                console.log(chalk.yellow('ℹ️  Using npx clawdbot (Clawdbot not globally installed)'));
            } catch (npxError) {
                throw new Error('Neither clawdbot nor npx found. Please install Clawdbot first.');
            }
        }
        
        // Start the gateway
        console.log(chalk.gray('Starting Clawdbot gateway...'));
        const gatewayProcess = execSync(`${clawdbotCommand} gateway start --detach`, { 
            encoding: 'utf8',
            timeout: 30000
        });
        
        console.log(chalk.green('✅ Clawdbot gateway started successfully!'));
        console.log('');
        
        // Show connection instructions
        showConnectionInstructions(config);
        
    } catch (error) {
        console.log(chalk.red('❌ Failed to start Clawdbot automatically.'));
        console.log(chalk.gray(`Error: ${error.message}`));
        console.log('');
        
        // Offer to install Clawdbot
        if (error.message.includes('clawdbot') && error.message.includes('not found')) {
            await offerToInstallClawdbot();
        } else {
            showManualInstructions(config);
        }
    }
}

/**
 * Offer to install Clawdbot
 */
async function offerToInstallClawdbot() {
    console.log(chalk.yellow('🔍 Clawdbot is not installed on your system.'));
    console.log('');
    
    const { installNow } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'installNow',
            message: 'Would you like to install Clawdbot now?',
            default: true
        }
    ]);
    
    if (installNow) {
        console.log(chalk.blue('📦 Installing Clawdbot...'));
        
        try {
            // Determine the best installation method
            let installCommand = 'npm install -g clawdbot';
            
            // Check if user has pnpm
            try {
                execSync('which pnpm', { stdio: 'pipe' });
                installCommand = 'pnpm add -g clawdbot';
                console.log(chalk.gray('Using pnpm for installation...'));
            } catch (error) {
                console.log(chalk.gray('Using npm for installation...'));
            }
            
            execSync(installCommand, { stdio: 'inherit' });
            
            console.log(chalk.green('✅ Clawdbot installed successfully!'));
            console.log('');
            
            // Try starting again
            await startClawdbot();
            
        } catch (error) {
            console.log(chalk.red('❌ Failed to install Clawdbot automatically.'));
            console.log(chalk.gray('You may need to install it manually:'));
            console.log(chalk.white('  npm install -g clawdbot'));
            console.log(chalk.white('  # or'));
            console.log(chalk.white('  pnpm add -g clawdbot'));
            console.log('');
            
            showManualInstructions();
        }
    } else {
        showManualInstructions();
    }
}

/**
 * Show manual startup instructions
 */
function showManualInstructions(config) {
    console.log(chalk.blue.bold('📖 Manual Setup Instructions:'));
    console.log('');
    
    console.log(chalk.white('1. Install Clawdbot (if not already installed):'));
    console.log(chalk.gray('   npm install -g clawdbot'));
    console.log(chalk.gray('   # or: pnpm add -g clawdbot'));
    console.log('');
    
    console.log(chalk.white('2. Start the Clawdbot gateway:'));
    console.log(chalk.gray('   clawdbot gateway start'));
    console.log('');
    
    console.log(chalk.white('3. Connect your channels:'));
    
    if (config && config.channels) {
        config.channels.forEach(channel => {
            if (channel.enabled) {
                switch (channel.type) {
                    case 'whatsapp':
                        console.log(chalk.gray('   📱 WhatsApp: Scan the QR code that appears in your terminal'));
                        break;
                    case 'telegram':
                        console.log(chalk.gray('   📨 Telegram: Message your bot to start chatting'));
                        break;
                    case 'discord':
                        console.log(chalk.gray('   🎮 Discord: Invite your bot to a server or DM it'));
                        break;
                    case 'terminal':
                        console.log(chalk.gray('   💻 Terminal: Use "clawdbot chat" command'));
                        break;
                }
            }
        });
    }
    
    console.log('');
    console.log(chalk.white('4. Test your setup:'));
    console.log(chalk.gray('   Send "Hello" to your AI assistant through any configured channel'));
    console.log('');
}

/**
 * Show connection instructions after successful start
 */
function showConnectionInstructions(config) {
    console.log(chalk.blue.bold('🔗 How to Connect:'));
    console.log('');
    
    config.channels.forEach(channel => {
        if (!channel.enabled) return;
        
        switch (channel.type) {
            case 'whatsapp':
                console.log(chalk.white('📱 WhatsApp:'));
                console.log(chalk.gray('   • A QR code should appear in your terminal'));
                console.log(chalk.gray('   • Open WhatsApp on your phone > Linked Devices > Link a Device'));
                console.log(chalk.gray('   • Scan the QR code'));
                console.log(chalk.gray('   • Send "Hello" to test the connection'));
                break;
                
            case 'telegram':
                console.log(chalk.white('📨 Telegram:'));
                console.log(chalk.gray(`   • Open Telegram and search for your bot`));
                console.log(chalk.gray('   • Send /start to initialize the bot'));
                console.log(chalk.gray('   • Send "Hello" to test the connection'));
                break;
                
            case 'discord':
                console.log(chalk.white('🎮 Discord:'));
                console.log(chalk.gray('   • Invite your bot to a Discord server'));
                console.log(chalk.gray('   • Or send it a direct message'));
                console.log(chalk.gray('   • Use your command prefix (e.g., !hello) to test'));
                break;
                
            case 'terminal':
                console.log(chalk.white('💻 Terminal:'));
                console.log(chalk.gray('   • Open a new terminal window'));
                console.log(chalk.gray('   • Run: clawdbot chat'));
                console.log(chalk.gray('   • Type your message and press Enter'));
                break;
        }
        console.log('');
    });
    
    console.log(chalk.green.bold('🎉 Your AI assistant is ready to help!'));
    console.log('');
}

/**
 * Offer additional resources and next steps
 */
async function offerAdditionalResources() {
    const { showResources } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'showResources',
            message: 'Would you like to see additional resources and next steps?',
            default: false
        }
    ]);
    
    if (showResources) {
        console.log('');
        console.log(chalk.blue.bold('📚 Additional Resources:'));
        console.log('');
        
        console.log(chalk.white.bold('Documentation:'));
        console.log(chalk.gray('  • OpenClaw Documentation: https://docs.openclaw.ai'));
        console.log(chalk.gray('  • Setup Troubleshooting: https://kingos.net/docs/troubleshooting'));
        console.log(chalk.gray('  • Advanced Configuration: https://kingos.net/docs/advanced-config'));
        console.log('');
        
        console.log(chalk.white.bold('Community:'));
        console.log(chalk.gray('  • Discord Server: https://discord.gg/openclaw'));
        console.log(chalk.gray('  • GitHub Discussions: https://github.com/openclaw/discussions'));
        console.log(chalk.gray('  • Reddit Community: https://reddit.com/r/openclaw'));
        console.log('');
        
        console.log(chalk.white.bold('Next Steps:'));
        console.log(chalk.gray('  • Explore skills and plugins'));
        console.log(chalk.gray('  • Set up automation workflows'));
        console.log(chalk.gray('  • Configure advanced security settings'));
        console.log(chalk.gray('  • Integrate with your favorite tools'));
        console.log('');
        
        console.log(chalk.white.bold('Need Help?'));
        console.log(chalk.gray('  • Email: support@kingos.net'));
        console.log(chalk.gray('  • Documentation: https://kingos.net/docs'));
        console.log(chalk.gray('  • Status Page: https://status.kingos.net'));
        console.log('');
    }
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