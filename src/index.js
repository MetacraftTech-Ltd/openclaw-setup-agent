/**
 * OpenClaw Setup Agent - Main Module
 * 
 * This module orchestrates the entire setup process, from initial welcome
 * to final validation and launch offer.
 */

import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import inquirer from 'inquirer';
import { welcomeFlow } from './prompts/welcome.js';
import { environmentAnalysis } from './prompts/environment.js';
import { providerFlow } from './prompts/providers.js';
import { channelsFlow } from './prompts/channels.js';
import { generateConfig } from './generators/config.js';
import { validateSetup } from './validators/setup.js';
import { finalizeSetup } from './prompts/finalize.js';

/**
 * Main setup agent function
 * This is the primary entry point called from the CLI
 */
export async function setupAgent() {
    try {
        // Show beautiful welcome banner
        console.clear();
        showWelcomeBanner();
        
        // Step 1: Welcome and explanation
        const welcomeResult = await welcomeFlow();
        if (!welcomeResult.proceed) {
            console.log(chalk.yellow('\n👋 Setup cancelled. Run openclaw-setup again when you\'re ready!'));
            return;
        }
        
        // Step 2: Environment analysis
        console.log(chalk.blue('\n🔍 Analyzing your system environment...'));
        const envSpinner = ora('Scanning system configuration').start();
        const environment = await environmentAnalysis();
        envSpinner.succeed('Environment analysis complete');
        
        // Show environment summary
        displayEnvironmentSummary(environment);
        
        // Step 3: Provider selection and configuration
        console.log(chalk.blue('\n🧠 Setting up AI providers...'));
        const providers = await providerFlow(environment);
        
        // Step 4: Channel selection and setup
        console.log(chalk.blue('\n💬 Configuring communication channels...'));
        const channels = await channelsFlow(environment);
        
        // Step 5: Generate clawdbot.yaml configuration
        console.log(chalk.blue('\n⚙️  Generating configuration...'));
        const configSpinner = ora('Creating clawdbot.yaml').start();
        const config = await generateConfig({
            environment,
            providers,
            channels,
            userPreferences: welcomeResult.preferences
        });
        configSpinner.succeed('Configuration generated successfully');
        
        // Step 6: Validate configuration
        console.log(chalk.blue('\n✅ Validating setup...'));
        const validationSpinner = ora('Testing configuration').start();
        const validation = await validateSetup(config, environment);
        
        if (validation.isValid) {
            validationSpinner.succeed('Configuration validated successfully');
        } else {
            validationSpinner.fail('Configuration validation failed');
            console.log(chalk.red('\n❌ Issues found:'));
            validation.errors.forEach(error => {
                console.log(chalk.red(`  • ${error}`));
            });
            
            // Offer to fix issues or continue anyway
            const { shouldContinue } = await inquirer.prompt([{
                type: 'confirm',
                name: 'shouldContinue',
                message: 'Would you like to continue with these issues?',
                default: false
            }]);
            
            if (!shouldContinue) {
                console.log(chalk.yellow('\n👋 Setup cancelled. Issues need to be resolved first.'));
                return;
            }
        }
        
        // Step 7: Finalize and offer to start Clawdbot
        await finalizeSetup(config, validation);
        
        // Success banner
        showSuccessBanner();
        
    } catch (error) {
        console.error(chalk.red('\n❌ Setup failed:'), error.message);
        console.log(chalk.gray('\nFor support, visit: https://kingos.net/support'));
        process.exit(1);
    }
}

/**
 * Display the welcome banner
 */
function showWelcomeBanner() {
    const banner = chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🦾 OpenClaw Setup Agent v1.0.0                 ║
║                                                           ║
║     From zero to working AI assistant in 30 minutes      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
    
    console.log(banner);
    console.log(chalk.gray('Powered by King OS Platform • https://kingos.net\n'));
}

/**
 * Display environment analysis summary
 */
function displayEnvironmentSummary(environment) {
    console.log(boxen(
        chalk.white.bold('🖥️  System Environment\n\n') +
        chalk.green(`✅ Operating System: ${environment.os.platform} ${environment.os.version}\n`) +
        chalk.green(`✅ Architecture: ${environment.os.arch}\n`) +
        chalk.green(`✅ Node.js: ${environment.runtime.nodeVersion}\n`) +
        chalk.green(`✅ Package Manager: ${environment.runtime.packageManager}\n`) +
        (environment.issues.length > 0 
            ? chalk.yellow(`\n⚠️  Issues detected: ${environment.issues.length}\n`) +
              environment.issues.map(issue => chalk.yellow(`   • ${issue}`)).join('\n')
            : chalk.green('\n🎉 No issues detected!')),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: environment.issues.length > 0 ? 'yellow' : 'green'
        }
    ));
}

/**
 * Display success banner
 */
function showSuccessBanner() {
    const successBanner = boxen(
        chalk.green.bold('🎉 OpenClaw Setup Complete!') + '\n\n' +
        chalk.white('Your AI assistant is ready to use.\n') +
        chalk.gray('Configuration saved to: ./clawdbot.yaml\n\n') +
        chalk.cyan('Next steps:\n') +
        chalk.white('• Test your setup with: clawdbot gateway start\n') +
        chalk.white('• Open your configured channels (WhatsApp, Telegram, etc.)\n') +
        chalk.white('• Start chatting with your AI assistant!\n\n') +
        chalk.gray('Need help? Visit: https://kingos.net/docs/openclaw'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green',
            backgroundColor: 'black'
        }
    );
    
    console.log('\n' + successBanner);
}