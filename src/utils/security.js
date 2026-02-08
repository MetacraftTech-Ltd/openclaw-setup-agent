/**
 * Security Hardening - Apply security best practices during setup
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { execSync } from 'child_process';

/**
 * Apply security hardening to the generated configuration
 */
export function applySecurityHardening(config, configPath) {
    console.log(chalk.blue('\n🛡️  Applying security hardening...'));
    
    const securityResults = {
        applied: [],
        warnings: [],
        recommendations: []
    };

    // 1. Set gateway address to localhost only
    if (config.gateway && config.gateway.address !== '127.0.0.1') {
        config.gateway.address = '127.0.0.1';
        securityResults.applied.push('Gateway address set to 127.0.0.1 (localhost only)');
    }

    // 2. Enable token authentication
    if (!config.authentication) {
        config.authentication = {};
    }
    if (config.authentication.mode !== 'token') {
        config.authentication.mode = 'token';
        securityResults.applied.push('Authentication mode set to "token"');
    }

    // 3. Set restrictive policies
    if (!config.dmPolicy || config.dmPolicy !== 'pairing') {
        config.dmPolicy = 'pairing';
        securityResults.applied.push('DM policy set to "pairing" (secure)');
    }

    if (!config.groupPolicy || config.groupPolicy !== 'disabled') {
        config.groupPolicy = 'disabled';
        securityResults.applied.push('Group policy set to "disabled" (secure default)');
    }

    // 4. Secure file permissions
    if (configPath) {
        try {
            // Set restrictive permissions (700 = rwx------)
            fs.chmodSync(configPath, 0o700);
            securityResults.applied.push('Configuration file permissions set to 700 (owner only)');
        } catch (error) {
            securityResults.warnings.push('Could not set secure file permissions: ' + error.message);
        }

        // Also secure the directory
        try {
            const configDir = path.dirname(configPath);
            const stats = fs.statSync(configDir);
            if ((stats.mode & 0o777) !== 0o700) {
                fs.chmodSync(configDir, 0o700);
                securityResults.applied.push('Configuration directory permissions secured');
            }
        } catch (error) {
            securityResults.warnings.push('Could not secure configuration directory: ' + error.message);
        }
    }

    // 5. Add security headers and settings
    if (!config.security) {
        config.security = {};
    }

    // Rate limiting
    if (!config.security.rateLimit) {
        config.security.rateLimit = {
            enabled: true,
            maxRequests: 60,
            windowMinutes: 1,
            blockDuration: 300 // 5 minutes
        };
        securityResults.applied.push('Rate limiting enabled (60 requests/minute)');
    }

    // Input validation
    if (!config.security.inputValidation) {
        config.security.inputValidation = {
            enabled: true,
            maxLength: 10000,
            sanitizeHtml: true,
            blockSuspiciousPatterns: true
        };
        securityResults.applied.push('Input validation and sanitization enabled');
    }

    // Network security
    if (!config.security.network) {
        config.security.network = {
            allowedOrigins: ['localhost', '127.0.0.1'],
            requireHttps: false, // Will be enabled for production
            corsEnabled: false
        };
        securityResults.applied.push('Network security restrictions applied');
    }

    // 6. Secure logging
    if (!config.logging) {
        config.logging = {};
    }
    if (!config.logging.security) {
        config.logging.security = {
            logFailedAuth: true,
            logRateLimits: true,
            logSuspiciousActivity: true,
            sanitizeLogs: true,
            maxLogSize: '100MB'
        };
        securityResults.applied.push('Security logging enabled');
    }

    // Generate security recommendations
    generateSecurityRecommendations(securityResults, config);

    return securityResults;
}

/**
 * Generate security recommendations based on configuration
 */
function generateSecurityRecommendations(securityResults, config) {
    // Check for remote access needs
    securityResults.recommendations.push(
        'Gateway bound to localhost (127.0.0.1) - only accessible from this machine'
    );

    // Tailscale recommendation for remote access
    securityResults.recommendations.push(
        'For secure remote access, consider Tailscale: https://tailscale.com/'
    );

    // API key management
    if (hasAPIKeys(config)) {
        securityResults.recommendations.push(
            'Store API keys securely - never commit configuration files to version control'
        );
        securityResults.recommendations.push(
            'Rotate API keys regularly and revoke unused keys'
        );
        securityResults.recommendations.push(
            'Monitor API usage for unusual activity'
        );
    }

    // Firewall recommendations
    if (os.platform() === 'linux') {
        securityResults.recommendations.push(
            'Consider enabling UFW firewall: sudo ufw enable'
        );
    } else if (os.platform() === 'darwin') {
        securityResults.recommendations.push(
            'macOS firewall is recommended for additional security'
        );
    }

    // Regular updates
    securityResults.recommendations.push(
        'Keep OpenClaw and system packages updated regularly'
    );
    securityResults.recommendations.push(
        'Review security logs periodically for suspicious activity'
    );

    // Backup recommendations
    securityResults.recommendations.push(
        'Backup your configuration file securely'
    );
    securityResults.recommendations.push(
        'Test your security configuration periodically'
    );
}

/**
 * Check if configuration contains API keys
 */
function hasAPIKeys(config) {
    if (!config.providers) return false;
    
    for (const provider of config.providers) {
        if (provider.apiKey && provider.apiKey !== 'setup-required') {
            return true;
        }
    }
    
    return false;
}

/**
 * Display security hardening results
 */
export function displaySecurityResults(securityResults) {
    console.log('');
    
    // Applied security measures
    if (securityResults.applied.length > 0) {
        console.log(chalk.green.bold('✅ Security Measures Applied:'));
        securityResults.applied.forEach(measure => {
            console.log(chalk.green(`   • ${measure}`));
        });
        console.log('');
    }

    // Warnings
    if (securityResults.warnings.length > 0) {
        console.log(chalk.yellow.bold('⚠️  Security Warnings:'));
        securityResults.warnings.forEach(warning => {
            console.log(chalk.yellow(`   • ${warning}`));
        });
        console.log('');
    }

    // Recommendations
    if (securityResults.recommendations.length > 0) {
        console.log(chalk.blue.bold('🔒 Security Recommendations:'));
        securityResults.recommendations.forEach(rec => {
            console.log(chalk.blue(`   • ${rec}`));
        });
        console.log('');
    }
}

/**
 * Generate Tailscale setup instructions
 */
export function generateTailscaleInstructions() {
    const platform = os.platform();
    let instructions = [];

    instructions.push('🌐 Setting up Tailscale for Secure Remote Access:');
    instructions.push('');
    
    switch (platform) {
        case 'darwin':
            instructions.push('1. Download Tailscale from the Mac App Store');
            instructions.push('   OR visit: https://tailscale.com/download/mac');
            instructions.push('2. Install and sign up for a free account');
            instructions.push('3. Run: sudo tailscale up');
            break;
            
        case 'linux':
            instructions.push('1. Install Tailscale:');
            instructions.push('   curl -fsSL https://tailscale.com/install.sh | sh');
            instructions.push('2. Connect to Tailscale:');
            instructions.push('   sudo tailscale up');
            instructions.push('3. Follow the authentication URL');
            break;
            
        case 'win32':
            instructions.push('1. Download Tailscale from: https://tailscale.com/download/windows');
            instructions.push('2. Install and sign up for a free account');
            instructions.push('3. Connect to your Tailscale network');
            break;
            
        default:
            instructions.push('1. Visit: https://tailscale.com/download/');
            instructions.push('2. Download for your platform');
            instructions.push('3. Follow platform-specific instructions');
    }

    instructions.push('');
    instructions.push('4. Find your Tailscale IP: tailscale ip -4');
    instructions.push('5. Update your client connections to use Tailscale IP');
    instructions.push('');
    instructions.push('Benefits:');
    instructions.push('• Secure encrypted tunnel');
    instructions.push('• No need to open firewall ports');
    instructions.push('• Access from anywhere');
    instructions.push('• Free for personal use');

    return instructions;
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config) {
    const issues = [];
    const suggestions = [];

    // Check gateway binding
    if (config.gateway && config.gateway.address === '0.0.0.0') {
        issues.push('Gateway bound to 0.0.0.0 - accessible from any network interface');
        suggestions.push('Change gateway.address to "127.0.0.1" for localhost only');
    }

    // Check authentication
    if (!config.authentication || config.authentication.mode !== 'token') {
        issues.push('Token authentication not enabled');
        suggestions.push('Enable token authentication for better security');
    }

    // Check policies
    if (config.dmPolicy !== 'pairing') {
        suggestions.push('Consider setting dmPolicy to "pairing" for better security');
    }

    if (config.groupPolicy !== 'disabled') {
        suggestions.push('Consider disabling group policy initially');
    }

    // Check for plaintext API keys in logs
    if (config.logging && !config.logging.security?.sanitizeLogs) {
        suggestions.push('Enable log sanitization to prevent API key leakage');
    }

    return {
        issues,
        suggestions,
        isSecure: issues.length === 0
    };
}

/**
 * Create security checklist for post-setup
 */
export function createSecurityChecklist() {
    return [
        {
            category: 'Configuration Security',
            items: [
                'Configuration file has restrictive permissions (700)',
                'Gateway bound to localhost (127.0.0.1)',
                'Token authentication enabled',
                'Security logging enabled'
            ]
        },
        {
            category: 'Network Security',
            items: [
                'Firewall configured appropriately',
                'No unnecessary ports exposed',
                'Tailscale or VPN for remote access',
                'Regular security updates applied'
            ]
        },
        {
            category: 'API Key Management',
            items: [
                'API keys stored securely',
                'Configuration not in version control',
                'Regular API key rotation',
                'API usage monitoring enabled'
            ]
        },
        {
            category: 'Operational Security',
            items: [
                'Regular log review process',
                'Incident response plan',
                'Backup and recovery procedures',
                'Security testing schedule'
            ]
        }
    ];
}