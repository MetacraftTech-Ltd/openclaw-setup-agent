/**
 * Environment Analysis - System scanning and compatibility checking
 */

import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import which from 'which';
import semver from 'semver';
import chalk from 'chalk';

/**
 * Analyze the system environment for OpenClaw compatibility
 */
export async function environmentAnalysis() {
    const environment = {
        os: getOSInfo(),
        runtime: await getRuntimeInfo(),
        network: await getNetworkInfo(),
        storage: getStorageInfo(),
        issues: [],
        compatibility: 'unknown'
    };

    // Analyze compatibility and detect issues
    analyzeCompatibility(environment);

    return environment;
}

/**
 * Get operating system information
 */
function getOSInfo() {
    const platform = os.platform();
    const version = os.release();
    const arch = os.arch();
    
    let friendlyName = platform;
    let supportLevel = 'unknown';
    
    switch (platform) {
        case 'darwin':
            friendlyName = `macOS ${version}`;
            supportLevel = 'excellent';
            break;
        case 'linux':
            friendlyName = getLinuxDistribution() || `Linux ${version}`;
            supportLevel = 'excellent';
            break;
        case 'win32':
            friendlyName = `Windows ${version}`;
            supportLevel = 'good';
            break;
        default:
            supportLevel = 'limited';
    }
    
    return {
        platform,
        version,
        arch,
        friendlyName,
        supportLevel
    };
}

/**
 * Get Linux distribution info
 */
function getLinuxDistribution() {
    try {
        // Try reading /etc/os-release
        if (fs.existsSync('/etc/os-release')) {
            const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
            const prettyName = osRelease.match(/PRETTY_NAME="([^"]+)"/);
            if (prettyName) {
                return prettyName[1];
            }
        }
        
        // Fallback to lsb_release if available
        const lsbRelease = execSync('lsb_release -d -s', { encoding: 'utf8' }).trim();
        return lsbRelease.replace(/"/g, '');
    } catch (error) {
        return null;
    }
}

/**
 * Get runtime environment information (Node.js, npm, etc.)
 */
async function getRuntimeInfo() {
    const runtime = {
        nodeVersion: null,
        npmVersion: null,
        pnpmVersion: null,
        yarnVersion: null,
        packageManager: 'npm',
        nodeCompatible: false,
        hasGlobalInstallPermissions: false
    };
    
    // Check Node.js version
    try {
        runtime.nodeVersion = process.version;
        runtime.nodeCompatible = semver.gte(runtime.nodeVersion, '18.0.0');
    } catch (error) {
        // Node.js version check failed
    }
    
    // Check package managers
    try {
        runtime.npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
        // npm not found
    }
    
    try {
        const pnpmPath = await which('pnpm');
        if (pnpmPath) {
            runtime.pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
            runtime.packageManager = 'pnpm';
        }
    } catch (error) {
        // pnpm not available
    }
    
    try {
        const yarnPath = await which('yarn');
        if (yarnPath) {
            runtime.yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
            if (!runtime.pnpmVersion) {
                runtime.packageManager = 'yarn';
            }
        }
    } catch (error) {
        // yarn not available
    }
    
    // Check global install permissions
    try {
        const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
        runtime.globalPrefix = npmPrefix;
        runtime.hasGlobalInstallPermissions = await checkGlobalInstallPermissions(npmPrefix);
    } catch (error) {
        // Could not check global install permissions
    }
    
    return runtime;
}

/**
 * Check if we can install global packages
 */
async function checkGlobalInstallPermissions(prefix) {
    try {
        const testPath = path.join(prefix, 'lib', 'node_modules', '.test-permission');
        
        // Try to create a test file
        fs.writeFileSync(testPath, 'test');
        fs.unlinkSync(testPath);
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get network connectivity information
 */
async function getNetworkInfo() {
    const network = {
        hasInternet: false,
        dnsWorking: false,
        npmRegistryAccessible: false,
        githubAccessible: false,
        proxy: null
    };
    
    // Check basic internet connectivity
    try {
        execSync('ping -c 1 google.com', { timeout: 5000 });
        network.hasInternet = true;
        network.dnsWorking = true;
    } catch (error) {
        // Try with different DNS
        try {
            execSync('ping -c 1 8.8.8.8', { timeout: 5000 });
            network.hasInternet = true;
        } catch (error) {
            // No internet or severe connectivity issues
        }
    }
    
    // Check npm registry access
    if (network.hasInternet) {
        try {
            execSync('npm ping', { timeout: 10000 });
            network.npmRegistryAccessible = true;
        } catch (error) {
            // npm registry not accessible
        }
        
        // Check GitHub access
        try {
            execSync('ping -c 1 github.com', { timeout: 5000 });
            network.githubAccessible = true;
        } catch (error) {
            // GitHub not accessible
        }
    }
    
    // Check for proxy configuration
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    if (httpProxy || httpsProxy) {
        network.proxy = { http: httpProxy, https: httpsProxy };
    }
    
    return network;
}

/**
 * Get storage and filesystem information
 */
function getStorageInfo() {
    const homedir = os.homedir();
    const tmpdir = os.tmpdir();
    
    const storage = {
        homedir,
        tmpdir,
        availableSpace: 0,
        hasWritePermissions: false
    };
    
    // Check available space (simplified)
    try {
        const stats = fs.statSync(homedir);
        storage.hasWritePermissions = true;
        
        // Get disk usage (Unix-like systems)
        if (os.platform() !== 'win32') {
            const dfOutput = execSync(`df -h "${homedir}"`, { encoding: 'utf8' });
            const lines = dfOutput.split('\n');
            if (lines.length > 1) {
                const columns = lines[1].split(/\s+/);
                storage.availableSpace = columns[3] || 'Unknown';
            }
        }
    } catch (error) {
        // Could not check storage
    }
    
    return storage;
}

/**
 * Analyze compatibility and detect potential issues
 */
function analyzeCompatibility(environment) {
    const issues = [];
    
    // Check Node.js version
    if (!environment.runtime.nodeCompatible) {
        issues.push(`Node.js ${environment.runtime.nodeVersion} is too old. OpenClaw requires Node.js 18.0.0 or newer.`);
        environment.compatibility = 'incompatible';
    }
    
    // Check package manager
    if (!environment.runtime.npmVersion && !environment.runtime.pnpmVersion && !environment.runtime.yarnVersion) {
        issues.push('No package manager found. Please install npm, pnpm, or yarn.');
        environment.compatibility = 'incompatible';
    }
    
    // Check global install permissions
    if (!environment.runtime.hasGlobalInstallPermissions) {
        issues.push('Cannot install global packages. You may need to use sudo or configure npm properly.');
    }
    
    // Check network connectivity
    if (!environment.network.hasInternet) {
        issues.push('No internet connection detected. Internet access is required for setup.');
        environment.compatibility = 'incompatible';
    } else if (!environment.network.npmRegistryAccessible) {
        issues.push('Cannot access npm registry. Check firewall or proxy settings.');
    }
    
    // Platform-specific issues
    if (environment.os.platform === 'win32') {
        issues.push('Windows support requires WSL2 or PowerShell with proper permissions.');
    }
    
    // Check available space
    if (environment.storage.availableSpace && environment.storage.availableSpace.includes('M')) {
        const spaceMB = parseInt(environment.storage.availableSpace);
        if (spaceMB < 500) {
            issues.push('Low disk space detected. OpenClaw requires at least 500MB of free space.');
        }
    }
    
    // Set overall compatibility
    if (environment.compatibility === 'unknown') {
        if (issues.length === 0) {
            environment.compatibility = 'excellent';
        } else if (issues.length <= 2) {
            environment.compatibility = 'good';
        } else {
            environment.compatibility = 'poor';
        }
    }
    
    environment.issues = issues;
}