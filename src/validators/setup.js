/**
 * Setup Validator - Validate the generated configuration and setup
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

/**
 * Validate the complete setup configuration
 */
export async function validateSetup(configData, environment) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        checks: []
    };

    // Validate configuration file
    await validateConfigFile(configData, validation);
    
    // Validate providers
    await validateProviders(configData.config.providers, validation);
    
    // Validate channels
    await validateChannels(configData.config.channels, validation);
    
    // Validate system requirements
    await validateSystemRequirements(environment, validation);
    
    // Validate security settings
    await validateSecurity(configData.config.security, validation);
    
    // Set overall validity
    validation.isValid = validation.errors.length === 0;
    
    return validation;
}

/**
 * Validate the configuration file structure
 */
async function validateConfigFile(configData, validation) {
    const check = { name: 'Configuration File', status: 'checking' };
    validation.checks.push(check);
    
    try {
        // Check if file exists and is readable
        if (!fs.existsSync(configData.configPath)) {
            validation.errors.push('Configuration file was not created');
            check.status = 'failed';
            return;
        }
        
        // Check if file is valid YAML
        const fileContent = fs.readFileSync(configData.configPath, 'utf8');
        const parsedConfig = yaml.load(fileContent);
        
        if (!parsedConfig) {
            validation.errors.push('Configuration file is empty or invalid YAML');
            check.status = 'failed';
            return;
        }
        
        // Validate required sections
        const requiredSections = ['gateway', 'providers', 'channels', 'agent'];
        const missingSections = requiredSections.filter(section => !parsedConfig[section]);
        
        if (missingSections.length > 0) {
            validation.errors.push(`Missing required sections: ${missingSections.join(', ')}`);
            check.status = 'failed';
            return;
        }
        
        // Check file permissions
        const stats = fs.statSync(configData.configPath);
        if (process.platform !== 'win32') {
            // Check if file is readable by others (potential security risk)
            if (stats.mode & 0o044) {
                validation.warnings.push('Configuration file is readable by others - consider restricting permissions');
            }
        }
        
        check.status = 'passed';
        
    } catch (error) {
        validation.errors.push(`Configuration validation failed: ${error.message}`);
        check.status = 'failed';
    }
}

/**
 * Validate AI providers configuration
 */
async function validateProviders(providersConfig, validation) {
    const check = { name: 'AI Providers', status: 'checking' };
    validation.checks.push(check);
    
    try {
        const enabledProviders = Object.entries(providersConfig).filter(([, config]) => config.enabled);
        
        if (enabledProviders.length === 0) {
            validation.errors.push('No AI providers are enabled');
            check.status = 'failed';
            return;
        }
        
        // Check if there's at least one primary provider
        const primaryProviders = enabledProviders.filter(([, config]) => config.primary);
        if (primaryProviders.length === 0) {
            validation.warnings.push('No primary AI provider set - first provider will be used as default');
        } else if (primaryProviders.length > 1) {
            validation.warnings.push('Multiple primary providers set - only first will be used');
        }
        
        // Validate each provider
        let validProviders = 0;
        for (const [name, config] of enabledProviders) {
            const providerValid = await validateSingleProvider(name, config, validation);
            if (providerValid) validProviders++;
        }
        
        if (validProviders === 0) {
            validation.errors.push('No valid AI providers configured');
            check.status = 'failed';
        } else if (validProviders < enabledProviders.length) {
            validation.warnings.push(`${enabledProviders.length - validProviders} provider(s) failed validation`);
            check.status = 'warning';
        } else {
            check.status = 'passed';
        }
        
    } catch (error) {
        validation.errors.push(`Provider validation failed: ${error.message}`);
        check.status = 'failed';
    }
}

/**
 * Validate a single AI provider
 */
async function validateSingleProvider(name, config, validation) {
    try {
        // Check required fields
        if (!config.model) {
            validation.errors.push(`Provider ${name}: Missing model name`);
            return false;
        }
        
        // Validate based on provider type
        if (name === 'anthropic') {
            if (!config.apiKey) {
                validation.errors.push(`Provider ${name}: Missing API key`);
                return false;
            }
            
            if (!config.apiKey.startsWith('sk-ant-')) {
                validation.errors.push(`Provider ${name}: Invalid API key format`);
                return false;
            }
            
            // Quick API test (if specified in config)
            if (config.apiKey && config.apiKey !== 'your-api-key-here') {
                const isValid = await testAnthropicConnection(config.apiKey, config.model);
                if (!isValid) {
                    validation.warnings.push(`Provider ${name}: API connection test failed`);
                }
            }
        }
        
        if (name === 'openai') {
            if (!config.apiKey) {
                validation.errors.push(`Provider ${name}: Missing API key`);
                return false;
            }
            
            if (!config.apiKey.startsWith('sk-')) {
                validation.errors.push(`Provider ${name}: Invalid API key format`);
                return false;
            }
        }
        
        if (name === 'ollama') {
            if (!config.baseUrl) {
                validation.errors.push(`Provider ${name}: Missing base URL`);
                return false;
            }
            
            // Test Ollama connection
            const isReachable = await testOllamaConnection(config.baseUrl);
            if (!isReachable) {
                validation.warnings.push(`Provider ${name}: Cannot reach Ollama server at ${config.baseUrl}`);
            }
        }
        
        return true;
        
    } catch (error) {
        validation.warnings.push(`Provider ${name}: Validation error - ${error.message}`);
        return false;
    }
}

/**
 * Validate communication channels configuration
 */
async function validateChannels(channelsConfig, validation) {
    const check = { name: 'Communication Channels', status: 'checking' };
    validation.checks.push(check);
    
    try {
        const enabledChannels = Object.entries(channelsConfig).filter(([, config]) => config.enabled);
        
        if (enabledChannels.length === 0) {
            validation.warnings.push('No communication channels enabled - you can only use terminal interface');
        }
        
        // Validate each channel
        let validChannels = 0;
        for (const [name, config] of enabledChannels) {
            const channelValid = await validateSingleChannel(name, config, validation);
            if (channelValid) validChannels++;
        }
        
        if (validChannels === enabledChannels.length) {
            check.status = 'passed';
        } else {
            check.status = 'warning';
        }
        
    } catch (error) {
        validation.errors.push(`Channel validation failed: ${error.message}`);
        check.status = 'failed';
    }
}

/**
 * Validate a single communication channel
 */
async function validateSingleChannel(name, config, validation) {
    try {
        // Validate based on channel type
        switch (name) {
            case 'whatsapp':
                // WhatsApp requires no pre-validation (QR code setup happens at runtime)
                return true;
                
            case 'telegram':
                if (!config.botToken) {
                    validation.errors.push(`Channel ${name}: Missing bot token`);
                    return false;
                }
                
                if (!config.botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
                    validation.errors.push(`Channel ${name}: Invalid bot token format`);
                    return false;
                }
                
                // Test Telegram bot token (optional)
                const telegramValid = await testTelegramBot(config.botToken);
                if (!telegramValid) {
                    validation.warnings.push(`Channel ${name}: Bot token validation failed`);
                }
                break;
                
            case 'discord':
                if (!config.botToken) {
                    validation.errors.push(`Channel ${name}: Missing bot token`);
                    return false;
                }
                
                if (config.botToken.length < 50) {
                    validation.warnings.push(`Channel ${name}: Bot token seems too short`);
                }
                break;
                
            case 'slack':
                if (!config.botToken || config.botToken === 'xoxb-your-bot-token') {
                    validation.warnings.push(`Channel ${name}: Requires manual configuration of bot tokens`);
                }
                break;
                
            case 'terminal':
                // Terminal channel always works
                return true;
        }
        
        return true;
        
    } catch (error) {
        validation.warnings.push(`Channel ${name}: Validation error - ${error.message}`);
        return false;
    }
}

/**
 * Validate system requirements
 */
async function validateSystemRequirements(environment, validation) {
    const check = { name: 'System Requirements', status: 'checking' };
    validation.checks.push(check);
    
    try {
        // Check Node.js version
        if (!environment.runtime.nodeCompatible) {
            validation.errors.push(`Node.js ${environment.runtime.nodeVersion} is too old. Requires 18.0.0 or newer`);
            check.status = 'failed';
            return;
        }
        
        // Check package manager
        if (!environment.runtime.npmVersion && !environment.runtime.pnpmVersion) {
            validation.errors.push('No package manager (npm/pnpm) found');
            check.status = 'failed';
            return;
        }
        
        // Check network connectivity
        if (!environment.network.hasInternet) {
            validation.errors.push('No internet connection detected');
            check.status = 'failed';
            return;
        }
        
        if (!environment.network.npmRegistryAccessible) {
            validation.warnings.push('Cannot access npm registry - may affect package installation');
        }
        
        // Check available disk space
        if (environment.storage.availableSpace && environment.storage.availableSpace.includes('M')) {
            const spaceMB = parseInt(environment.storage.availableSpace);
            if (spaceMB < 500) {
                validation.warnings.push('Low disk space detected - OpenClaw requires at least 500MB');
            }
        }
        
        // Check global install permissions
        if (!environment.runtime.hasGlobalInstallPermissions) {
            validation.warnings.push('Cannot install global packages - may need sudo or npm configuration');
        }
        
        check.status = 'passed';
        
    } catch (error) {
        validation.errors.push(`System requirements check failed: ${error.message}`);
        check.status = 'failed';
    }
}

/**
 * Validate security configuration
 */
async function validateSecurity(securityConfig, validation) {
    const check = { name: 'Security Settings', status: 'checking' };
    validation.checks.push(check);
    
    try {
        // Check if security is properly configured
        if (!securityConfig) {
            validation.warnings.push('No security configuration found - using defaults');
            check.status = 'warning';
            return;
        }
        
        // Check rate limiting
        if (!securityConfig.rateLimiting?.enabled) {
            validation.warnings.push('Rate limiting is disabled - may be vulnerable to abuse');
        }
        
        // Check allowed domains
        if (securityConfig.allowedDomains?.includes('*')) {
            validation.warnings.push('All domains are allowed - consider restricting to trusted domains');
        }
        
        // Check encryption
        if (!securityConfig.encryption?.enabled) {
            validation.warnings.push('Encryption is disabled - sensitive data may not be protected');
        }
        
        check.status = 'passed';
        
    } catch (error) {
        validation.warnings.push(`Security validation failed: ${error.message}`);
        check.status = 'warning';
    }
}

/**
 * Test Anthropic API connection
 */
async function testAnthropicConnection(apiKey, model) {
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
                max_tokens: 1,
                messages: [{ role: 'user', content: 'test' }]
            })
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Test Ollama connection
 */
async function testOllamaConnection(baseUrl) {
    try {
        const response = await fetch(`${baseUrl}/api/version`, { timeout: 5000 });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Test Telegram bot token
 */
async function testTelegramBot(botToken) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const data = await response.json();
        return data.ok;
    } catch (error) {
        return false;
    }
}