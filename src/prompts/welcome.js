/**
 * Welcome Flow - Initial user interaction and explanation
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Welcome flow - explains OpenClaw and gets user consent
 */
export async function welcomeFlow() {
    // Explain what OpenClaw is and what this agent will do
    console.log(chalk.white.bold('Welcome to the OpenClaw Setup Agent! 🦾'));
    console.log('');
    console.log(chalk.gray('OpenClaw (Clawdbot) is an advanced AI assistant framework that lets you:'));
    console.log(chalk.white('  • Chat with Claude, GPT, and other AI models via WhatsApp, Telegram, Discord'));
    console.log(chalk.white('  • Automate tasks like web browsing, file management, and research'));
    console.log(chalk.white('  • Control smart devices and integrate with your workflow'));
    console.log(chalk.white('  • Run completely self-hosted for maximum privacy and control'));
    console.log('');
    console.log(chalk.yellow('This setup agent will guide you through:'));
    console.log(chalk.gray('  1. Analyzing your system environment'));
    console.log(chalk.gray('  2. Installing required dependencies'));
    console.log(chalk.gray('  3. Configuring AI providers (Anthropic, OpenAI, etc.)'));
    console.log(chalk.gray('  4. Setting up communication channels'));
    console.log(chalk.gray('  5. Testing and validating your setup'));
    console.log('');
    console.log(chalk.green('Estimated time: 20-30 minutes'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: 'Ready to set up your AI assistant?',
            default: true
        }
    ]);

    if (!answers.proceed) {
        return { proceed: false };
    }

    // Get user preferences
    console.log('');
    console.log(chalk.blue('Let me learn a bit about your preferences:'));
    
    const preferences = await inquirer.prompt([
        {
            type: 'list',
            name: 'experience',
            message: 'How familiar are you with AI assistants and self-hosting?',
            choices: [
                { name: '🔰 Beginner - I\'m new to this', value: 'beginner' },
                { name: '🛠️  Intermediate - I have some experience', value: 'intermediate' },
                { name: '⚡ Advanced - I know what I\'m doing', value: 'advanced' }
            ]
        },
        {
            type: 'list',
            name: 'primaryUse',
            message: 'What will you primarily use your AI assistant for?',
            choices: [
                { name: '💬 Personal chat and questions', value: 'personal' },
                { name: '💼 Work and productivity', value: 'work' },
                { name: '🤖 Automation and development', value: 'automation' },
                { name: '🧪 Experimentation and learning', value: 'experiment' }
            ]
        },
        {
            type: 'checkbox',
            name: 'preferredChannels',
            message: 'Which communication channels would you like to use?',
            choices: [
                { name: '📱 WhatsApp', value: 'whatsapp', checked: true },
                { name: '📨 Telegram', value: 'telegram' },
                { name: '🎮 Discord', value: 'discord' },
                { name: '💼 Slack', value: 'slack' },
                { name: '💻 Terminal/CLI only', value: 'terminal' }
            ],
            validate(answer) {
                if (answer.length < 1) {
                    return 'Please select at least one communication channel.';
                }
                return true;
            }
        }
    ]);

    // Show what we'll focus on based on their preferences
    console.log('');
    console.log(chalk.green('Perfect! Based on your preferences, I\'ll:'));
    
    if (preferences.experience === 'beginner') {
        console.log(chalk.white('  • Provide detailed explanations for each step'));
        console.log(chalk.white('  • Use safe, well-tested configurations'));
        console.log(chalk.white('  • Include helpful tips and troubleshooting'));
    } else if (preferences.experience === 'advanced') {
        console.log(chalk.white('  • Move through setup more quickly'));
        console.log(chalk.white('  • Provide advanced configuration options'));
        console.log(chalk.white('  • Show technical details when relevant'));
    }
    
    if (preferences.primaryUse === 'work') {
        console.log(chalk.white('  • Focus on productivity and business features'));
        console.log(chalk.white('  • Suggest professional channel integrations'));
    } else if (preferences.primaryUse === 'automation') {
        console.log(chalk.white('  • Enable advanced automation capabilities'));
        console.log(chalk.white('  • Configure developer-friendly features'));
    }
    
    console.log(chalk.white(`  • Set up ${preferences.preferredChannels.length} communication channel${preferences.preferredChannels.length > 1 ? 's' : ''}`));
    console.log('');

    return {
        proceed: true,
        preferences: {
            experience: preferences.experience,
            primaryUse: preferences.primaryUse,
            preferredChannels: preferences.preferredChannels
        }
    };
}