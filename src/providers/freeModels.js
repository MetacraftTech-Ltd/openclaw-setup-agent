/**
 * Free Model Configuration - Setup for users without subscriptions or API keys
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fetch from 'node-fetch';

/**
 * Configure free AI models for users without subscriptions
 */
export async function configureFreeModels(systemInfo) {
    console.log('');
    console.log(chalk.white.bold('🆓 Free AI Model Setup'));
    console.log(chalk.gray('Setting up free AI services for you. These have usage limits but are great to get started.'));
    console.log('');

    // Show warning about free model limitations
    displayFreeModelWarning();

    const models = [];

    // Primary free model selection
    const primaryModel = await selectPrimaryFreeModel(systemInfo);
    if (primaryModel) {
        models.push(primaryModel);
    }

    // Offer fallback model
    const { wantFallback } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'wantFallback',
            message: 'Would you like to add a fallback model for when the primary is unavailable?',
            default: true
        }
    ]);

    if (wantFallback) {
        const fallbackModel = await selectFallbackFreeModel(primaryModel?.name);
        if (fallbackModel) {
            models.push(fallbackModel);
        }
    }

    // Suggest local option if hardware supports it
    if (systemInfo.capabilities.canRunLocal) {
        const { wantLocal } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'wantLocal',
                message: 'Your system can run local AI models. Would you like to set up Ollama for offline use?',
                default: systemInfo.capabilities.recommendLocal
            }
        ]);

        if (wantLocal) {
            const localModel = await configureLocalModel(systemInfo);
            if (localModel) {
                models.push(localModel);
            }
        }
    }

    // Show upgrade recommendations
    displayUpgradeRecommendations();

    return models;
}

/**
 * Display warning about free model limitations
 */
function displayFreeModelWarning() {
    const warningBox = chalk.yellow('⚠️  Important: Free Model Limitations') + '\n\n' +
        chalk.white('Free AI models have some limitations:') + '\n' +
        chalk.gray('• Usage quotas and rate limits') + '\n' +
        chalk.gray('• May be slower or less reliable') + '\n' +
        chalk.gray('• Limited features compared to paid models') + '\n' +
        chalk.gray('• Service availability not guaranteed') + '\n\n' +
        chalk.cyan('💡 Perfect for getting started and experimentation!');

    console.log(warningBox);
    console.log('');
}

/**
 * Select primary free model
 */
async function selectPrimaryFreeModel(systemInfo) {
    const { primaryChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'primaryChoice',
            message: 'Which free AI service would you like as your primary?',
            choices: [
                {
                    name: '🌟 Kimi K2.5 (via Nvidia NIM) - Recommended free option',
                    value: 'kimi-k25',
                    short: 'Kimi K2.5'
                },
                {
                    name: '✨ Google Gemini Flash - Fast and capable',
                    value: 'gemini-flash',
                    short: 'Gemini Flash'
                },
                {
                    name: '🤖 Hugging Face Transformers - Open source models',
                    value: 'huggingface',
                    short: 'Hugging Face'
                },
                {
                    name: '🏠 Local only (Ollama) - Privacy focused',
                    value: 'local-only',
                    short: 'Local Only'
                }
            ]
        }
    ]);

    switch (primaryChoice) {
        case 'kimi-k25':
            return await configureKimiK25();
        case 'gemini-flash':
            return await configureGeminiFlash();
        case 'huggingface':
            return await configureHuggingFace();
        case 'local-only':
            if (systemInfo.capabilities.canRunLocal) {
                return await configureLocalModel(systemInfo);
            } else {
                console.log(chalk.red('❌ Local models require at least 8GB RAM. Please choose a cloud option.'));
                return await selectPrimaryFreeModel(systemInfo); // Recursive retry
            }
        default:
            return null;
    }
}

/**
 * Select fallback free model
 */
async function selectFallbackFreeModel(excludeModel) {
    const choices = [
        {
            name: '🌟 Kimi K2.5 (via Nvidia NIM)',
            value: 'kimi-k25',
            short: 'Kimi K2.5'
        },
        {
            name: '✨ Google Gemini Flash',
            value: 'gemini-flash',
            short: 'Gemini Flash'
        },
        {
            name: '🤖 Hugging Face Free Tier',
            value: 'huggingface',
            short: 'Hugging Face'
        }
    ].filter(choice => choice.value !== excludeModel);

    if (choices.length === 0) {
        return null;
    }

    const { fallbackChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'fallbackChoice',
            message: 'Select a fallback model:',
            choices: choices
        }
    ]);

    switch (fallbackChoice) {
        case 'kimi-k25':
            return await configureKimiK25(false);
        case 'gemini-flash':
            return await configureGeminiFlash(false);
        case 'huggingface':
            return await configureHuggingFace(false);
        default:
            return null;
    }
}

/**
 * Configure Kimi K2.5 via Nvidia NIM
 */
async function configureKimiK25(isPrimary = true) {
    console.log(chalk.gray('Kimi K2.5 is available for free through Nvidia\'s NIM service.'));
    console.log(chalk.gray('No API key required - just needs a free Nvidia account.'));
    console.log('');

    const { proceedKimi } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceedKimi',
            message: 'Set up Kimi K2.5 through Nvidia NIM?',
            default: true
        }
    ]);

    if (!proceedKimi) {
        return null;
    }

    return {
        name: 'kimi-k25-free',
        type: 'nvidia-nim',
        model: 'kimi/kimi-k2.5',
        baseUrl: 'https://integrate.api.nvidia.com/v1',
        apiKey: 'free-tier', // Special marker for free tier
        isPrimary: isPrimary,
        enabled: true,
        limits: {
            requestsPerHour: 100,
            tokensPerRequest: 4096,
            note: 'Free tier limits - upgrade to Nvidia API for more'
        },
        setup: {
            instructions: [
                'Visit https://build.nvidia.com/nim',
                'Create a free account or sign in',
                'Find Kimi K2.5 in the model catalog',
                'Use the provided endpoint for free inference'
            ]
        }
    };
}

/**
 * Configure Google Gemini Flash
 */
async function configureGeminiFlash(isPrimary = true) {
    console.log(chalk.gray('Google Gemini Flash offers a generous free tier.'));
    console.log(chalk.gray('Get your free API key from Google AI Studio.'));
    console.log('');

    const { setupGemini } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'setupGemini',
            message: 'Would you like to set up Google Gemini Flash?',
            default: true
        }
    ]);

    if (!setupGemini) {
        return null;
    }

    const { hasApiKey } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'hasApiKey',
            message: 'Do you already have a Google AI Studio API key?',
            default: false
        }
    ]);

    let apiKey = null;
    if (hasApiKey) {
        const { geminiKey } = await inquirer.prompt([
            {
                type: 'password',
                name: 'geminiKey',
                message: 'Enter your Google AI Studio API key:',
                mask: '*',
                validate: (input) => {
                    if (!input) return 'API key is required';
                    if (input.length < 20) return 'API key seems too short';
                    return true;
                }
            }
        ]);
        apiKey = geminiKey;

        // Test the API key
        console.log(chalk.gray('Testing API key...'));
        const isValid = await testGeminiAPI(apiKey);
        if (!isValid) {
            console.log(chalk.red('❌ API key test failed. Proceeding without validation.'));
        } else {
            console.log(chalk.green('✅ Gemini API key validated!'));
        }
    }

    return {
        name: 'gemini-flash-free',
        type: 'google-ai',
        model: 'gemini-1.5-flash',
        apiKey: apiKey || 'setup-required',
        isPrimary: isPrimary,
        enabled: true,
        limits: {
            requestsPerMinute: 15,
            requestsPerDay: 1500,
            tokensPerRequest: 1000000,
            note: 'Generous free tier - 1,500 requests per day'
        },
        setup: apiKey ? null : {
            instructions: [
                'Visit https://makersuite.google.com/app/apikey',
                'Sign in with your Google account',
                'Create a new API key',
                'Copy the key and add it to your configuration'
            ]
        }
    };
}

/**
 * Configure Hugging Face free tier
 */
async function configureHuggingFace(isPrimary = true) {
    console.log(chalk.gray('Hugging Face provides free inference for many open source models.'));
    console.log(chalk.gray('Create a free account to get started.'));
    console.log('');

    const { setupHF } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'setupHF',
            message: 'Set up Hugging Face Inference API?',
            default: true
        }
    ]);

    if (!setupHF) {
        return null;
    }

    const { hasHFToken } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'hasHFToken',
            message: 'Do you have a Hugging Face access token?',
            default: false
        }
    ]);

    let token = null;
    if (hasHFToken) {
        const { hfToken } = await inquirer.prompt([
            {
                type: 'password',
                name: 'hfToken',
                message: 'Enter your Hugging Face token:',
                mask: '*'
            }
        ]);
        token = hfToken;
    }

    // Model selection
    const { hfModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'hfModel',
            message: 'Which Hugging Face model would you like to use?',
            choices: [
                {
                    name: 'Microsoft DialoGPT-medium - Good for conversation',
                    value: 'microsoft/DialoGPT-medium'
                },
                {
                    name: 'Google FLAN-T5-large - Instruction following',
                    value: 'google/flan-t5-large'
                },
                {
                    name: 'Meta Llama 2 7B Chat - General purpose',
                    value: 'meta-llama/Llama-2-7b-chat-hf'
                },
                {
                    name: 'Mistral 7B Instruct - Fast and capable',
                    value: 'mistralai/Mistral-7B-Instruct-v0.1'
                }
            ]
        }
    ]);

    return {
        name: 'huggingface-free',
        type: 'huggingface',
        model: hfModel,
        apiKey: token || 'setup-required',
        baseUrl: 'https://api-inference.huggingface.co/models',
        isPrimary: isPrimary,
        enabled: true,
        limits: {
            note: 'Free tier with rate limits - may have cold starts'
        },
        setup: token ? null : {
            instructions: [
                'Visit https://huggingface.co/settings/tokens',
                'Sign in or create a free account',
                'Create a new access token with "read" permissions',
                'Copy the token and add it to your configuration'
            ]
        }
    };
}

/**
 * Configure local Ollama model
 */
async function configureLocalModel(systemInfo) {
    console.log(chalk.gray('Ollama allows you to run AI models locally for complete privacy.'));
    console.log(chalk.gray('Models will be downloaded and stored on your system.'));
    console.log('');

    // Check if Ollama is installed
    let ollamaInstalled = false;
    try {
        const { execSync } = await import('child_process');
        execSync('ollama version', { timeout: 5000 });
        ollamaInstalled = true;
        console.log(chalk.green('✅ Ollama is already installed'));
    } catch (error) {
        console.log(chalk.yellow('ℹ️  Ollama not detected - will provide installation instructions'));
    }

    const { proceedLocal } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceedLocal',
            message: ollamaInstalled ? 'Configure local model with Ollama?' : 'Set up Ollama for local AI models?',
            default: true
        }
    ]);

    if (!proceedLocal) {
        return null;
    }

    // Model size recommendation based on RAM
    const memoryGB = systemInfo.memory.total || 0;
    let recommendedModels = [];

    if (memoryGB >= 32) {
        recommendedModels = [
            { name: 'Llama 3.1 70B - Highest quality (requires 64GB+ RAM)', value: 'llama3.1:70b', size: '40GB' },
            { name: 'Llama 3.1 8B - Recommended balance', value: 'llama3.1:8b', size: '4.7GB' },
            { name: 'Qwen 2.5 7B - Fast and efficient', value: 'qwen2.5:7b', size: '4.4GB' }
        ];
    } else if (memoryGB >= 16) {
        recommendedModels = [
            { name: 'Llama 3.1 8B - Recommended for your system', value: 'llama3.1:8b', size: '4.7GB' },
            { name: 'Qwen 2.5 7B - Slightly faster', value: 'qwen2.5:7b', size: '4.4GB' },
            { name: 'Gemma 2 9B - Google\'s model', value: 'gemma2:9b', size: '5.4GB' }
        ];
    } else {
        recommendedModels = [
            { name: 'Qwen 2.5 7B - Best for limited RAM', value: 'qwen2.5:7b', size: '4.4GB' },
            { name: 'Llama 3.1 8B - May be slower', value: 'llama3.1:8b', size: '4.7GB' },
            { name: 'Gemma 2 2B - Smallest option', value: 'gemma2:2b', size: '1.6GB' }
        ];
    }

    const { localModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'localModel',
            message: `Which local model would you like? (You have ~${memoryGB}GB RAM)`,
            choices: recommendedModels.map(model => ({
                name: `${model.name} (${model.size})`,
                value: model.value,
                short: model.value
            }))
        }
    ]);

    return {
        name: 'ollama-local',
        type: 'ollama',
        model: localModel,
        baseUrl: 'http://localhost:11434',
        isPrimary: false, // Local is usually fallback unless they chose local-only
        enabled: true,
        requirements: {
            ollama: !ollamaInstalled
        },
        setup: ollamaInstalled ? null : {
            instructions: [
                'Install Ollama from https://ollama.ai/',
                'Run: ollama pull ' + localModel,
                'Start Ollama service: ollama serve',
                'Test with: ollama run ' + localModel + ' "Hello"'
            ]
        }
    };
}

/**
 * Test Gemini API key
 */
async function testGeminiAPI(apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: 'GET',
            timeout: 10000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Display upgrade recommendations
 */
function displayUpgradeRecommendations() {
    console.log('');
    console.log(chalk.cyan.bold('💡 Upgrade Recommendations'));
    console.log('');
    console.log(chalk.white('When you\'re ready for more powerful AI:'));
    console.log(chalk.blue('• Claude Pro ($20/month) - Best overall experience'));
    console.log(chalk.blue('• ChatGPT Plus ($20/month) - Popular choice with GPT-4'));
    console.log(chalk.blue('• Anthropic API ($5+ pay-as-go) - Most flexible for developers'));
    console.log(chalk.blue('• OpenAI API ($5+ pay-as-go) - Access to latest GPT models'));
    console.log('');
    console.log(chalk.gray('These offer faster responses, higher quality, and more features.'));
    console.log('');
}