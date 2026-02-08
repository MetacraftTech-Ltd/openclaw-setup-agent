/**
 * OpenClaw Setup Agent - Main Module
 * 
 * This module orchestrates the entire setup process, from subscription detection
 * to final validation and post-setup guide generation.
 */

import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import { welcomeFlow } from './prompts/welcome.js';
import { subscriptionDetectionFlow } from './prompts/subscription.js';
import { performSystemPreCheck, displaySystemCheck } from './utils/systemCheck.js';
import { environmentAnalysis } from './prompts/environment.js';
import { providerFlow } from './prompts/providers.js';
import { configureFreeModels } from './providers/freeModels.js';
import { channelsFlow } from './prompts/channels.js';
import { generateConfig } from './generators/config.js';
import { applySecurityHardening, displaySecurityResults } from './utils/security.js';
import { validateSetup } from './validators/setup.js';
import { generatePostSetupGuide, writePostSetupGuide, displayPostSetupSummary } from './generators/postSetup.js';
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
        
        // Step 2: NEW - Subscription Detection Flow
        console.log(chalk.blue('\n🔍 Detecting your AI subscription status...'));
        const subscriptionInfo = await subscriptionDetectionFlow();
        
        // Step 3: NEW - System Pre-Check
        console.log(chalk.blue('\n🖥️  Performing system pre-check...'));
        const systemCheckSpinner = ora('Analyzing hardware capabilities').start();
        const systemInfo = await performSystemPreCheck();
        systemCheckSpinner.succeed('System analysis complete');
        
        // Display system check results
        displaySystemCheck(systemInfo);
        
        // Step 4: Environment analysis (existing but enhanced)
        console.log(chalk.blue('\n🔧 Analyzing software environment...'));
        const envSpinner = ora('Scanning system configuration').start();
        const environment = await environmentAnalysis();
        envSpinner.succeed('Environment analysis complete');
        
        // Show environment summary
        displayEnvironmentSummary(environment);
        
        // Step 5: Provider selection based on subscription type
        console.log(chalk.blue('\n🧠 Setting up AI providers...'));
        let providers;
        
        if (subscriptionInfo.routing.recommendedPath === 'free-models') {
            providers = await configureFreeModels(systemInfo);
        } else {
            providers = await providerFlow(environment, subscriptionInfo, systemInfo);
        }
        
        // Step 6: Channel selection and setup
        console.log(chalk.blue('\n💬 Configuring communication channels...'));
        const channels = await channelsFlow(environment);
        
        // Step 7: Generate clawdbot.yaml configuration
        console.log(chalk.blue('\n⚙️  Generating configuration...'));
        const configSpinner = ora('Creating clawdbot.yaml').start();
        const configPath = path.resolve(process.cwd(), 'clawdbot.yaml');
        const config = await generateConfig({
            environment,
            providers,
            channels,
            userPreferences: welcomeResult.preferences,
            subscriptionInfo,
            systemInfo
        });
        configSpinner.succeed('Configuration generated successfully');
        
        // Step 8: NEW - Apply Security Hardening
        console.log(chalk.blue('\n🛡️  Applying security hardening...'));
        const securitySpinner = ora('Configuring security settings').start();
        const securityResults = applySecurityHardening(config, configPath);
        securitySpinner.succeed('Security hardening applied');
        
        // Display security results
        displaySecurityResults(securityResults);
        
        // Step 9: Validate configuration
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
        
        // Step 10: NEW - Generate Post-Setup Guide
        console.log(chalk.blue('\n📖 Generating your personalized setup guide...'));
        const guideSpinner = ora('Creating documentation').start();
        const postSetupGuide = generatePostSetupGuide(config, welcomeResult.preferences, {
            subscriptionInfo,
            systemInfo,
            securityResults,
            validation
        });
        
        const guidePath = path.resolve(process.cwd(), 'OPENCLAW_SETUP_GUIDE.md');
        const guideWritten = writePostSetupGuide(postSetupGuide, guidePath);
        guideSpinner.succeed('Setup guide generated');
        
        // Step 11: Finalize and offer to start Clawdbot
        await finalizeSetup(config, validation);
        
        // Step 12: NEW - Display personalized post-setup summary
        displayPostSetupSummary(postSetupGuide, guideWritten ? guidePath : null);
        
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
║           🦾 OpenClaw Setup Agent v1.1.0-beta.1          ║
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