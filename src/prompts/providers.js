/**
 * AI Providers Flow - Configure AI model providers and API keys
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fetch from 'node-fetch';

/**
 * Configure AI providers based on user preferences and subscription info
 */
export async function providerFlow(environment, subscriptionInfo = null, systemInfo = null) {
    console.log('');
    console.log(chalk.white.bold('🧠 AI Provider Setup'));
    console.log(chalk.gray('OpenClaw can work with multiple AI providers. Let\'s set up at least one.'));
    console.log('');

    // Show smart recommendations based on subscription
    if (subscriptionInfo) {
        displaySmartRecommendations(subscriptionInfo, systemInfo);
    }

    // Show provider options with recommendations
    const providerChoice = await inquirer.prompt([
        {
            type: 'list',
            name: 'primaryProvider',
            message: 'Which AI provider would you like to use as your primary?',
            choices: [
                {
                    name: '🎯 Anthropic Claude (Recommended) - Most advanced, great for complex tasks',
                    value: 'anthropic',
                    short: 'Anthropic Claude'
                },
                {
                    name: '🤖 OpenAI GPT - Popular choice, well-rounded performance',
                    value: 'openai',
                    short: 'OpenAI GPT'
                },
                {
                    name: '🔗 OpenRouter - Access to multiple models through one API',
                    value: 'openrouter',
                    short: 'OpenRouter'
                },
                {
                    name: '🏠 Local Models (Ollama) - Privacy-focused, runs on your hardware',
                    value: 'ollama',
                    short: 'Local Models'
                },
                {
                    name: '⚙️  Custom Provider - I have a different provider',
                    value: 'custom',
                    short: 'Custom'
                }
            ]
        }
    ]);

    const providers = [];
    
    // Configure primary provider
    const primaryProvider = await configureProvider(providerChoice.primaryProvider, true);
    if (primaryProvider) {
        providers.push(primaryProvider);
    }

    // Ask if they want to add additional providers
    const { wantAdditional } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'wantAdditional',
            message: 'Would you like to add additional AI providers for backup or experimentation?',
            default: false
        }
    ]);

    if (wantAdditional) {
        const availableProviders = ['anthropic', 'openai', 'openrouter', 'ollama', 'custom']
            .filter(p => p !== providerChoice.primaryProvider);
        
        const { additionalProviders } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'additionalProviders',
                message: 'Select additional providers to configure:',
                choices: availableProviders.map(provider => ({
                    name: getProviderDisplayName(provider),
                    value: provider
                }))
            }
        ]);

        for (const providerType of additionalProviders) {
            const provider = await configureProvider(providerType, false);
            if (provider) {
                providers.push(provider);
            }
        }
    }

    return providers;
}

/**
 * Configure a specific AI provider
 */
async function configureProvider(providerType, isPrimary) {
    console.log('');
    console.log(chalk.blue(`📋 Configuring ${getProviderDisplayName(providerType)}${isPrimary ? ' (Primary)' : ''}`));
    
    switch (providerType) {
        case 'anthropic':
            return await configureAnthropic(isPrimary);
        case 'openai':
            return await configureOpenAI(isPrimary);
        case 'openrouter':
            return await configureOpenRouter(isPrimary);
        case 'ollama':
            return await configureOllama(isPrimary);
        case 'custom':
            return await configureCustomProvider(isPrimary);
        default:
            console.log(chalk.red(`Unknown provider type: ${providerType}`));
            return null;
    }
}

/**
 * Configure Anthropic Claude
 */
async function configureAnthropic(isPrimary) {
    console.log(chalk.gray('Anthropic Claude is OpenClaw\'s recommended AI provider.'));
    console.log(chalk.gray('Get your API key from: https://console.anthropic.com/'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your Anthropic API key:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'API key is required';
                if (!input.startsWith('sk-ant-')) return 'Anthropic API keys start with "sk-ant-"';
                if (input.length < 20) return 'API key seems too short';
                return true;
            }
        },
        {
            type: 'list',
            name: 'model',
            message: 'Which Claude model would you like to use?',
            choices: [
                { name: 'Claude 3.5 Sonnet (⭐ Recommended) - Best balance of speed and intelligence', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3.5 Haiku - Fastest, great for simple tasks', value: 'claude-3-5-haiku-20241022' },
                { name: 'Claude 3 Opus - Most capable, use for onboarding only (expensive)', value: 'claude-3-opus-20240229' }
            ],
            default: 'claude-3-5-sonnet-20241022'
        }
    ]);

    // Test the API key
    console.log(chalk.gray('Testing API key...'));
    const isValid = await testAnthropicAPI(answers.apiKey, answers.model);
    
    if (!isValid) {
        console.log(chalk.red('❌ API key test failed. Please check your key and try again.'));
        return null;
    }

    console.log(chalk.green('✅ Anthropic API key validated successfully!'));

    return {
        name: 'anthropic',
        type: 'anthropic',
        apiKey: answers.apiKey,
        model: answers.model,
        isPrimary,
        enabled: true
    };
}

/**
 * Configure OpenAI GPT
 */
async function configureOpenAI(isPrimary) {
    console.log(chalk.gray('OpenAI provides GPT-4 and other popular models.'));
    console.log(chalk.gray('Get your API key from: https://platform.openai.com/api-keys'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your OpenAI API key:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'API key is required';
                if (!input.startsWith('sk-')) return 'OpenAI API keys start with "sk-"';
                if (input.length < 20) return 'API key seems too short';
                return true;
            }
        },
        {
            type: 'list',
            name: 'model',
            message: 'Which OpenAI model would you like to use?',
            choices: [
                { name: 'GPT-4o (Recommended) - Latest multimodal model', value: 'gpt-4o' },
                { name: 'GPT-4o Mini - Faster and cheaper for daily use', value: 'gpt-4o-mini' },
                { name: 'GPT-4 Turbo - Previous generation, still excellent', value: 'gpt-4-turbo' },
                { name: '⚠️  GPT-4.1 - Avoid (known tool execution issues)', value: 'gpt-4.1', disabled: true }
            ].filter(choice => !choice.disabled),
            default: 'gpt-4o'
        }
    ]);

    // Test the API key
    console.log(chalk.gray('Testing API key...'));
    const isValid = await testOpenAIAPI(answers.apiKey, answers.model);
    
    if (!isValid) {
        console.log(chalk.red('❌ API key test failed. Please check your key and try again.'));
        return null;
    }

    console.log(chalk.green('✅ OpenAI API key validated successfully!'));

    return {
        name: 'openai',
        type: 'openai',
        apiKey: answers.apiKey,
        model: answers.model,
        isPrimary,
        enabled: true
    };
}

/**
 * Configure OpenRouter
 */
async function configureOpenRouter(isPrimary) {
    console.log(chalk.gray('OpenRouter provides access to many AI models through a single API.'));
    console.log(chalk.gray('Get your API key from: https://openrouter.ai/keys'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your OpenRouter API key:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'API key is required';
                if (input.length < 20) return 'API key seems too short';
                return true;
            }
        },
        {
            type: 'list',
            name: 'model',
            message: 'Which model would you like to use?',
            choices: [
                { name: 'Anthropic Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
                { name: 'OpenAI GPT-4o', value: 'openai/gpt-4o' },
                { name: 'Meta Llama 3.1 70B', value: 'meta-llama/llama-3.1-70b-instruct' },
                { name: 'Google Gemini Pro 1.5', value: 'google/gemini-pro-1.5' }
            ]
        }
    ]);

    return {
        name: 'openrouter',
        type: 'openrouter',
        apiKey: answers.apiKey,
        model: answers.model,
        baseUrl: 'https://openrouter.ai/api/v1',
        isPrimary,
        enabled: true
    };
}

/**
 * Configure local Ollama
 */
async function configureOllama(isPrimary) {
    console.log(chalk.gray('Ollama runs AI models locally on your hardware.'));
    console.log(chalk.gray('Visit: https://ollama.ai/ to download and install Ollama first.'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'baseUrl',
            message: 'Enter Ollama server URL:',
            default: 'http://localhost:11434',
            validate: (input) => {
                try {
                    new URL(input);
                    return true;
                } catch {
                    return 'Please enter a valid URL';
                }
            }
        },
        {
            type: 'list',
            name: 'model',
            message: 'Which local model would you like to use?',
            choices: [
                { name: 'Llama 3.1 8B (Recommended) - Good balance of speed and quality', value: 'llama3.1:8b' },
                { name: 'Llama 3.1 70B - Highest quality, requires powerful hardware', value: 'llama3.1:70b' },
                { name: 'Qwen 2.5 7B - Fast and efficient', value: 'qwen2.5:7b' },
                { name: 'Custom model name', value: 'custom' }
            ]
        }
    ]);

    let modelName = answers.model;
    if (answers.model === 'custom') {
        const { customModel } = await inquirer.prompt([{
            type: 'input',
            name: 'customModel',
            message: 'Enter the model name:',
            validate: (input) => input ? true : 'Model name is required'
        }]);
        modelName = customModel;
    }

    return {
        name: 'ollama',
        type: 'ollama',
        baseUrl: answers.baseUrl,
        model: modelName,
        isPrimary,
        enabled: true
    };
}

/**
 * Configure custom provider
 */
async function configureCustomProvider(isPrimary) {
    console.log(chalk.gray('Configure a custom OpenAI-compatible API provider.'));
    console.log('');

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Provider name (for your reference):',
            validate: (input) => input ? true : 'Provider name is required'
        },
        {
            type: 'input',
            name: 'baseUrl',
            message: 'API base URL:',
            validate: (input) => {
                try {
                    new URL(input);
                    return true;
                } catch {
                    return 'Please enter a valid URL';
                }
            }
        },
        {
            type: 'password',
            name: 'apiKey',
            message: 'API key:',
            mask: '*'
        },
        {
            type: 'input',
            name: 'model',
            message: 'Model name:',
            validate: (input) => input ? true : 'Model name is required'
        }
    ]);

    return {
        name: answers.name.toLowerCase().replace(/\s+/g, '-'),
        type: 'openai-compatible',
        baseUrl: answers.baseUrl,
        apiKey: answers.apiKey,
        model: answers.model,
        displayName: answers.name,
        isPrimary,
        enabled: true
    };
}

/**
 * Test Anthropic API key
 */
async function testAnthropicAPI(apiKey, model) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Test OpenAI API key
 */
async function testOpenAIAPI(apiKey, model) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 5,
                messages: [{ role: 'user', content: 'Hi' }]
            })
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Get display name for provider type
 */
function getProviderDisplayName(providerType) {
    switch (providerType) {
        case 'anthropic': return 'Anthropic Claude';
        case 'openai': return 'OpenAI GPT';
        case 'openrouter': return 'OpenRouter';
        case 'ollama': return 'Local Models (Ollama)';
        case 'custom': return 'Custom Provider';
        default: return providerType;
    }
}

/**
 * Display smart recommendations based on subscription and system info
 */
function displaySmartRecommendations(subscriptionInfo, systemInfo) {
    console.log(chalk.blue.bold('💡 Smart Recommendations Based on Your Setup:'));
    console.log('');

    switch (subscriptionInfo.subscriptionType) {
        case 'claude-subscription':
            console.log(chalk.green('✅ Perfect! You have Claude Pro/Max'));
            console.log(chalk.white('• Recommended: Use Claude 3.5 Sonnet for daily tasks'));
            console.log(chalk.white('• Consider: Claude 3 Opus for onboarding/complex tasks'));
            console.log(chalk.yellow('• Note: Use API for better OpenClaw integration'));
            break;

        case 'chatgpt-subscription':
            console.log(chalk.green('✅ Great! You have ChatGPT Plus/Pro/Max'));
            console.log(chalk.white('• Recommended: GPT-4o for balanced performance'));
            console.log(chalk.white('• Consider: GPT-4o Mini for frequent daily use'));
            console.log(chalk.red('• ⚠️  Avoid: GPT-4.1 (known tool execution issues)'));
            break;

        case 'api-keys':
            console.log(chalk.green('✅ Excellent! Direct API access'));
            console.log(chalk.white('• Primary: Claude 3.5 Sonnet (best balance)'));
            console.log(chalk.white('• Onboarding: Claude 3 Opus (highest quality)'));
            console.log(chalk.white('• Daily: Claude 3.5 Haiku (faster, cheaper)'));
            break;

        case 'developer-tools':
            console.log(chalk.green('✅ Developer-friendly setup'));
            console.log(chalk.white('• Consider: GitHub Copilot integration'));
            console.log(chalk.white('• Recommended: API-based providers for flexibility'));
            break;

        case 'free-only':
            console.log(chalk.yellow('ℹ️  Free tier setup - great for getting started!'));
            console.log(chalk.white('• Primary: Kimi K2.5 (free via Nvidia)'));
            console.log(chalk.white('• Fallback: Google Gemini Flash'));
            if (systemInfo?.capabilities?.canRunLocal) {
                console.log(chalk.white('• Bonus: Local models with your hardware'));
            }
            break;
    }

    // Hardware-specific recommendations
    if (systemInfo?.capabilities?.recommendLocal) {
        console.log('');
        console.log(chalk.cyan('🏠 Local AI Recommendation:'));
        console.log(chalk.white('• Your hardware can run local models efficiently'));
        console.log(chalk.white('• Consider Ollama for privacy and offline use'));
        console.log(chalk.white('• Suggested: Llama 3.1 8B or Qwen 2.5 7B'));
    } else if (systemInfo?.capabilities?.canRunLocal) {
        console.log('');
        console.log(chalk.yellow('💻 Limited Local AI:'));
        console.log(chalk.white('• Local models possible but may be slower'));
        console.log(chalk.white('• Stick to cloud providers for best experience'));
    }

    console.log('');
}