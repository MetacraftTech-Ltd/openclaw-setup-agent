/**
 * Configuration Generator - Generate clawdbot.yaml from user inputs
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Generate clawdbot.yaml configuration file
 */
export async function generateConfig(setupData) {
    const { environment, providers, channels, userPreferences } = setupData;
    
    // Build the configuration object
    const config = {
        // Gateway configuration
        gateway: {
            mode: 'local',
            host: '127.0.0.1',
            port: 18789,
            cors: {
                origin: '*',
                credentials: true
            }
        },
        
        // AI Model providers
        providers: generateProvidersConfig(providers),
        
        // Communication channels
        channels: generateChannelsConfig(channels),
        
        // Agent configuration
        agent: generateAgentConfig(userPreferences),
        
        // Security settings
        security: generateSecurityConfig(userPreferences),
        
        // Logging configuration
        logging: generateLoggingConfig(userPreferences),
        
        // Workspace configuration
        workspace: generateWorkspaceConfig(environment),
        
        // Skills and capabilities
        skills: generateSkillsConfig(userPreferences)
    };
    
    // Convert to YAML and save
    const yamlContent = generateYamlWithComments(config);
    const configPath = path.join(process.cwd(), 'clawdbot.yaml');
    
    fs.writeFileSync(configPath, yamlContent, 'utf8');
    
    return {
        config,
        configPath,
        yamlContent
    };
}

/**
 * Generate providers configuration section
 */
function generateProvidersConfig(providers) {
    const providersConfig = {};
    
    providers.forEach(provider => {
        const providerConfig = {
            enabled: provider.enabled,
            model: provider.model
        };
        
        if (provider.apiKey) {
            providerConfig.apiKey = provider.apiKey;
        }
        
        if (provider.baseUrl) {
            providerConfig.baseUrl = provider.baseUrl;
        }
        
        if (provider.isPrimary) {
            providerConfig.primary = true;
        }
        
        // Provider-specific settings
        switch (provider.type) {
            case 'anthropic':
                providerConfig.version = '2023-06-01';
                providerConfig.maxTokens = 4096;
                break;
                
            case 'openai':
                providerConfig.maxTokens = 4096;
                providerConfig.temperature = 0.7;
                break;
                
            case 'openrouter':
                providerConfig.headers = {
                    'HTTP-Referer': 'https://kingos.net',
                    'X-Title': 'OpenClaw Setup Agent'
                };
                break;
                
            case 'ollama':
                providerConfig.stream = true;
                providerConfig.keepAlive = '5m';
                break;
        }
        
        providersConfig[provider.name] = providerConfig;
    });
    
    return providersConfig;
}

/**
 * Generate channels configuration section
 */
function generateChannelsConfig(channels) {
    const channelsConfig = {};
    
    channels.forEach(channel => {
        if (!channel.enabled) return;
        
        const channelConfig = {
            enabled: true,
            ...channel.settings
        };
        
        // Channel-specific defaults
        switch (channel.type) {
            case 'whatsapp':
                channelConfig.qrTimeout = 60000;
                channelConfig.authStrategy = 'LocalAuth';
                channelConfig.puppeteerOptions = {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                };
                break;
                
            case 'telegram':
                channelConfig.polling = true;
                channelConfig.webHook = false;
                break;
                
            case 'discord':
                channelConfig.intents = channel.settings.intents || ['GUILD_MESSAGES', 'DIRECT_MESSAGES', 'MESSAGE_CONTENT'];
                break;
                
            case 'terminal':
                channelConfig.prompt = channel.settings.prompt || 'openclaw>';
                channelConfig.historyFile = path.join(os.homedir(), '.openclaw_history');
                break;
        }
        
        channelsConfig[channel.name] = channelConfig;
    });
    
    return channelsConfig;
}

/**
 * Generate agent configuration section
 */
function generateAgentConfig(userPreferences) {
    const baseConfig = {
        name: 'OpenClaw Assistant',
        description: 'Your personal AI assistant',
        personality: 'helpful',
        responseMode: 'conversational',
        memory: {
            enabled: true,
            maxHistory: 1000,
            persistTo: 'file'
        }
    };
    
    // Customize based on user preferences
    switch (userPreferences.primaryUse) {
        case 'work':
            baseConfig.personality = 'professional';
            baseConfig.name = 'OpenClaw Work Assistant';
            baseConfig.description = 'Your professional AI assistant for productivity and work tasks';
            break;
            
        case 'automation':
            baseConfig.personality = 'technical';
            baseConfig.name = 'OpenClaw Automation Agent';
            baseConfig.description = 'Your AI assistant for automation and development tasks';
            break;
            
        case 'experiment':
            baseConfig.personality = 'curious';
            baseConfig.name = 'OpenClaw Research Assistant';
            baseConfig.description = 'Your AI assistant for learning and experimentation';
            break;
    }
    
    // Adjust verbosity based on experience level
    switch (userPreferences.experience) {
        case 'beginner':
            baseConfig.responseMode = 'detailed';
            baseConfig.explainActions = true;
            break;
            
        case 'advanced':
            baseConfig.responseMode = 'concise';
            baseConfig.showTechnicalDetails = true;
            break;
    }
    
    return baseConfig;
}

/**
 * Generate security configuration section
 */
function generateSecurityConfig(userPreferences) {
    const securityConfig = {
        allowedDomains: ['*'],
        rateLimiting: {
            enabled: true,
            maxRequests: 100,
            windowMs: 60000
        },
        encryption: {
            enabled: true,
            algorithm: 'aes-256-gcm'
        }
    };
    
    // Stricter security for work/business use
    if (userPreferences.primaryUse === 'work') {
        securityConfig.allowedDomains = [
            'anthropic.com',
            'openai.com',
            'api.openrouter.ai',
            'github.com',
            'google.com'
        ];
        securityConfig.rateLimiting.maxRequests = 50;
        securityConfig.auditLogging = true;
    }
    
    return securityConfig;
}

/**
 * Generate logging configuration section
 */
function generateLoggingConfig(userPreferences) {
    const loggingConfig = {
        level: 'info',
        format: 'json',
        destinations: ['console', 'file'],
        file: {
            path: path.join(os.homedir(), '.openclaw', 'logs', 'openclaw.log'),
            maxSize: '10MB',
            maxFiles: 5
        }
    };
    
    // More verbose logging for beginners
    if (userPreferences.experience === 'beginner') {
        loggingConfig.level = 'debug';
        loggingConfig.includeTimestamp = true;
        loggingConfig.includeUserMessages = true;
    }
    
    // Less verbose for advanced users
    if (userPreferences.experience === 'advanced') {
        loggingConfig.level = 'warn';
        loggingConfig.format = 'compact';
    }
    
    return loggingConfig;
}

/**
 * Generate workspace configuration section
 */
function generateWorkspaceConfig(environment) {
    const workspaceConfig = {
        dataDir: path.join(os.homedir(), '.openclaw'),
        tempDir: os.tmpdir(),
        maxFileSize: '50MB',
        allowedFileTypes: ['.txt', '.md', '.json', '.yaml', '.yml', '.csv'],
        autoCleanup: true
    };
    
    // Platform-specific adjustments
    if (environment.os.platform === 'win32') {
        workspaceConfig.dataDir = path.join(os.homedir(), 'AppData', 'Roaming', 'openclaw');
    }
    
    return workspaceConfig;
}

/**
 * Generate skills configuration section
 */
function generateSkillsConfig(userPreferences) {
    const skillsConfig = {
        enabled: ['chat', 'help', 'system'],
        autoLoad: true,
        skillsDir: path.join(os.homedir(), '.openclaw', 'skills')
    };
    
    // Add skills based on primary use
    switch (userPreferences.primaryUse) {
        case 'work':
            skillsConfig.enabled.push('calendar', 'email', 'documents', 'search');
            break;
            
        case 'automation':
            skillsConfig.enabled.push('code', 'git', 'terminal', 'web', 'files');
            break;
            
        case 'experiment':
            skillsConfig.enabled.push('research', 'web', 'data', 'learning');
            break;
            
        default:
            skillsConfig.enabled.push('web', 'weather', 'news');
    }
    
    return skillsConfig;
}

/**
 * Generate YAML with helpful comments
 */
function generateYamlWithComments(config) {
    const header = `# OpenClaw Configuration File
# Generated by OpenClaw Setup Agent v1.0.0
# Generated on: ${new Date().toISOString()}
#
# This file configures your OpenClaw AI assistant.
# Edit this file to customize behavior, add new providers, or modify settings.
#
# Documentation: https://docs.openclaw.ai/configuration
# Support: https://kingos.net/support

`;

    const sections = {
        gateway: `
# Gateway Configuration
# Controls how OpenClaw communicates with channels and providers
`,
        providers: `
# AI Model Providers
# Configure which AI models to use and how to access them
`,
        channels: `
# Communication Channels
# Configure how you interact with your AI assistant
`,
        agent: `
# Agent Personality and Behavior
# Customize how your AI assistant responds and behaves
`,
        security: `
# Security Settings
# Configure access controls and security measures
`,
        logging: `
# Logging Configuration
# Control what gets logged and where
`,
        workspace: `
# Workspace Settings
# Configure file storage and workspace behavior
`,
        skills: `
# Skills and Capabilities
# Enable and configure different AI assistant capabilities
`
    };

    let yamlContent = header;
    
    Object.keys(config).forEach(section => {
        if (sections[section]) {
            yamlContent += sections[section];
        }
        yamlContent += yaml.dump({ [section]: config[section] }, {
            indent: 2,
            lineWidth: 100,
            noRefs: true
        });
        yamlContent += '\n';
    });
    
    // Add footer with helpful information
    const footer = `
# Configuration Tips:
# - Restart OpenClaw after making changes: clawdbot gateway restart
# - Test your configuration: clawdbot config validate
# - View active configuration: clawdbot config show
# - Get help: clawdbot help
#
# Need help? Visit https://kingos.net/docs or email support@kingos.net
`;
    
    yamlContent += footer;
    
    return yamlContent;
}