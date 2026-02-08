/**
 * Subscription Detection Flow - Detect user's current AI subscriptions and route appropriately
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Detect user's AI subscription status and provide appropriate routing
 */
export async function subscriptionDetectionFlow() {
    console.log('');
    console.log(chalk.white.bold('🔍 AI Subscription Detection'));
    console.log(chalk.gray('Let\'s understand your current AI setup to provide the best recommendations.'));
    console.log('');

    const { currentUsage } = await inquirer.prompt([
        {
            type: 'list',
            name: 'currentUsage',
            message: 'How do you currently use AI?',
            choices: [
                {
                    name: '💎 ChatGPT Plus/Pro/Max - I have OpenAI subscription',
                    value: 'chatgpt-subscription',
                    short: 'ChatGPT Subscription'
                },
                {
                    name: '🎯 Claude Pro/Max - I have Anthropic subscription', 
                    value: 'claude-subscription',
                    short: 'Claude Subscription'
                },
                {
                    name: '💻 Codex/GitHub Copilot - I have developer tools',
                    value: 'developer-tools',
                    short: 'Developer Tools'
                },
                {
                    name: '🔑 I have API keys - I\'m a developer with API access',
                    value: 'api-keys',
                    short: 'API Keys'
                },
                {
                    name: '🆓 Free tiers only - I use free AI services',
                    value: 'free-only',
                    short: 'Free Only'
                }
            ]
        }
    ]);

    // Route based on subscription type
    const routingInfo = getRoutingInfo(currentUsage);
    
    // Display routing information
    displayRoutingInfo(currentUsage, routingInfo);

    // Get confirmation to proceed
    const { proceedWithRoute } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceedWithRoute',
            message: 'Does this setup approach work for you?',
            default: true
        }
    ]);

    if (!proceedWithRoute) {
        console.log(chalk.yellow('\nLet\'s try a different approach...'));
        // Recursive call to allow user to choose different option
        return await subscriptionDetectionFlow();
    }

    return {
        subscriptionType: currentUsage,
        routing: routingInfo
    };
}

/**
 * Get routing information based on subscription type
 */
function getRoutingInfo(subscriptionType) {
    switch (subscriptionType) {
        case 'chatgpt-subscription':
            return {
                canProxy: true,
                hasApiAccess: false,
                recommendedPath: 'proxy-setup',
                warnings: [
                    'ChatGPT subscriptions don\'t include API access',
                    'We\'ll help you set up API proxying through your subscription'
                ],
                benefits: [
                    'Use your existing ChatGPT Plus/Pro/Max subscription',
                    'No additional API costs',
                    'Familiar ChatGPT responses'
                ]
            };
            
        case 'claude-subscription':
            return {
                canProxy: true,
                hasApiAccess: false,
                recommendedPath: 'proxy-setup',
                warnings: [
                    'Claude Pro/Max subscriptions don\'t include direct API access',
                    'We\'ll help you set up web interface proxying'
                ],
                benefits: [
                    'Leverage your existing Claude subscription',
                    'Access to Claude 3 Opus and Sonnet',
                    'Cost-effective for high usage'
                ]
            };
            
        case 'developer-tools':
            return {
                canProxy: false,
                hasApiAccess: true,
                recommendedPath: 'api-setup',
                warnings: [],
                benefits: [
                    'You likely have API access through GitHub/Microsoft',
                    'Familiar with developer workflows',
                    'Can integrate with existing tools'
                ]
            };
            
        case 'api-keys':
            return {
                canProxy: false,
                hasApiAccess: true,
                recommendedPath: 'api-setup',
                warnings: [],
                benefits: [
                    'Direct API access for maximum flexibility',
                    'Best performance and reliability',
                    'Full control over model selection and parameters'
                ]
            };
            
        case 'free-only':
            return {
                canProxy: false,
                hasApiAccess: false,
                recommendedPath: 'free-models',
                warnings: [
                    'Free models may be less reliable for complex tasks',
                    'Limited usage quotas and rate limits',
                    'Some features may not be available'
                ],
                benefits: [
                    'No cost to get started',
                    'Good for experimentation',
                    'Can upgrade later when needed'
                ],
                upgradeInfo: {
                    show: true,
                    recommended: 'claude-pro',
                    reason: 'Best balance of cost and capability for most users'
                }
            };
            
        default:
            return {
                canProxy: false,
                hasApiAccess: false,
                recommendedPath: 'api-setup',
                warnings: [],
                benefits: []
            };
    }
}

/**
 * Display routing information to user
 */
function displayRoutingInfo(subscriptionType, routingInfo) {
    console.log('');
    
    // Main recommendation
    console.log(chalk.blue.bold(`📋 Recommended Setup Path: ${formatPath(routingInfo.recommendedPath)}`));
    console.log('');
    
    // Benefits
    if (routingInfo.benefits.length > 0) {
        console.log(chalk.green('✅ Benefits:'));
        routingInfo.benefits.forEach(benefit => {
            console.log(chalk.green(`   • ${benefit}`));
        });
        console.log('');
    }
    
    // Warnings
    if (routingInfo.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Important Notes:'));
        routingInfo.warnings.forEach(warning => {
            console.log(chalk.yellow(`   • ${warning}`));
        });
        console.log('');
    }
    
    // Upgrade information for free users
    if (routingInfo.upgradeInfo && routingInfo.upgradeInfo.show) {
        console.log(chalk.cyan('💡 Upgrade Suggestion:'));
        console.log(chalk.cyan(`   Consider ${routingInfo.upgradeInfo.recommended} - ${routingInfo.upgradeInfo.reason}`));
        console.log('');
    }
}

/**
 * Format path name for display
 */
function formatPath(path) {
    switch (path) {
        case 'proxy-setup':
            return 'Subscription Proxy Setup';
        case 'api-setup':
            return 'Direct API Configuration';
        case 'free-models':
            return 'Free Model Configuration';
        default:
            return path;
    }
}

/**
 * Check if user can proceed with local models based on subscription
 */
export function canUseLocalModels(subscriptionInfo, systemInfo) {
    // Free users always get local option if hardware supports it
    if (subscriptionInfo.subscriptionType === 'free-only') {
        return systemInfo.memory >= 16; // 16GB+ for local models
    }
    
    // API users can supplement with local models
    if (subscriptionInfo.routing.hasApiAccess) {
        return systemInfo.memory >= 16;
    }
    
    // Subscription users might want local for privacy
    return systemInfo.memory >= 16;
}

/**
 * Get model recommendations based on subscription
 */
export function getModelRecommendations(subscriptionInfo, systemInfo) {
    const recommendations = {
        primary: null,
        fallback: null,
        onboarding: null,
        warnings: []
    };
    
    switch (subscriptionInfo.subscriptionType) {
        case 'claude-subscription':
            recommendations.primary = 'claude-3-5-sonnet-20241022';
            recommendations.onboarding = 'claude-3-opus-20240229';
            recommendations.fallback = 'kimi-k25-free';
            break;
            
        case 'chatgpt-subscription':
            recommendations.primary = 'gpt-4o';
            recommendations.onboarding = 'gpt-4o';  // No GPT-5 equivalent yet
            recommendations.fallback = 'kimi-k25-free';
            recommendations.warnings.push('Avoid GPT-4.1 due to known issues with tool execution');
            break;
            
        case 'api-keys':
            recommendations.primary = 'claude-3-5-sonnet-20241022';
            recommendations.onboarding = 'claude-3-opus-20240229';
            recommendations.fallback = 'claude-3-5-haiku-20241022';
            recommendations.warnings.push('Claude Sonnet recommended as best balance of speed and intelligence');
            break;
            
        case 'developer-tools':
            recommendations.primary = 'gpt-4o';
            recommendations.onboarding = 'gpt-4o';
            recommendations.fallback = 'gpt-4o-mini';
            break;
            
        case 'free-only':
            recommendations.primary = 'kimi-k25-free';
            recommendations.fallback = 'gemini-flash-free';
            recommendations.onboarding = 'kimi-k25-free';
            recommendations.warnings.push('Free models may be less reliable for complex tasks');
            
            // Add local option if hardware supports it
            if (systemInfo.memory >= 16) {
                recommendations.localOption = 'llama3.1:8b';
            }
            break;
    }
    
    return recommendations;
}