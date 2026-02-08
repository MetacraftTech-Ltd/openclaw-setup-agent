/**
 * System Pre-Check Utilities - Hardware and system capability detection
 */

import { execSync } from 'child_process';
import os from 'os';
import chalk from 'chalk';
import fs from 'fs';

/**
 * Perform comprehensive system pre-check
 */
export async function performSystemPreCheck() {
    console.log(chalk.blue('\n🔍 Performing system pre-check...'));
    
    const systemInfo = {
        memory: await checkMemory(),
        disk: await checkDiskSpace(),
        gpu: await checkGPU(),
        architecture: os.arch(),
        platform: os.platform(),
        capabilities: {
            canRunLocal: false,
            cloudOnly: false,
            recommendLocal: false
        },
        warnings: [],
        recommendations: []
    };
    
    // Analyze capabilities based on system specs
    analyzeSystemCapabilities(systemInfo);
    
    return systemInfo;
}

/**
 * Check system memory (RAM)
 */
async function checkMemory() {
    try {
        const platform = os.platform();
        let totalMemoryGB = 0;
        let memoryInfo = {};
        
        if (platform === 'linux') {
            // Use free command for Linux
            const freeOutput = execSync('free -m', { encoding: 'utf8' });
            const lines = freeOutput.split('\n');
            const memLine = lines[1];
            const columns = memLine.split(/\s+/);
            const totalMB = parseInt(columns[1]);
            totalMemoryGB = Math.round(totalMB / 1024 * 10) / 10; // Round to 1 decimal
            
            memoryInfo = {
                total: totalMemoryGB,
                totalMB: totalMB,
                available: parseInt(columns[6]) || parseInt(columns[3]), // available or free
                used: parseInt(columns[2]),
                platform: 'linux'
            };
        } else if (platform === 'darwin') {
            // Use sysctl for macOS
            const memSizeBytes = execSync('sysctl -n hw.memsize', { encoding: 'utf8' }).trim();
            totalMemoryGB = Math.round(parseInt(memSizeBytes) / (1024 * 1024 * 1024) * 10) / 10;
            
            // Get memory pressure info
            let memPressure = 'normal';
            try {
                const pressureOutput = execSync('memory_pressure', { encoding: 'utf8' });
                if (pressureOutput.includes('warn')) memPressure = 'warn';
                if (pressureOutput.includes('critical')) memPressure = 'critical';
            } catch (error) {
                // memory_pressure command not available, use vm_stat as fallback
                try {
                    const vmStatOutput = execSync('vm_stat', { encoding: 'utf8' });
                    // Simple heuristic based on vm_stat output
                    const freePages = parseInt(vmStatOutput.match(/Pages free:\s+(\d+)/)?.[1] || '0');
                    const pageSize = 4096; // Default page size on macOS
                    const freeMB = (freePages * pageSize) / (1024 * 1024);
                    if (freeMB < 1024) memPressure = 'warn';
                    if (freeMB < 512) memPressure = 'critical';
                } catch (vmError) {
                    // Fallback failed, keep default
                }
            }
            
            memoryInfo = {
                total: totalMemoryGB,
                totalMB: totalMemoryGB * 1024,
                pressure: memPressure,
                platform: 'darwin'
            };
        } else if (platform === 'win32') {
            // Use wmic for Windows
            const wmicOutput = execSync('wmic computersystem get TotalPhysicalMemory /value', { encoding: 'utf8' });
            const match = wmicOutput.match(/TotalPhysicalMemory=(\d+)/);
            if (match) {
                const totalBytes = parseInt(match[1]);
                totalMemoryGB = Math.round(totalBytes / (1024 * 1024 * 1024) * 10) / 10;
            }
            
            memoryInfo = {
                total: totalMemoryGB,
                totalMB: totalMemoryGB * 1024,
                platform: 'win32'
            };
        }
        
        return memoryInfo;
    } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not detect memory information'));
        return {
            total: 0,
            totalMB: 0,
            platform: os.platform(),
            error: error.message
        };
    }
}

/**
 * Check available disk space
 */
async function checkDiskSpace() {
    try {
        const platform = os.platform();
        let diskInfo = {};
        
        if (platform === 'win32') {
            // Use dir for Windows
            const dirOutput = execSync('dir /-c', { encoding: 'utf8', cwd: process.cwd() });
            const match = dirOutput.match(/(\d+) bytes free/);
            if (match) {
                const freeBytes = parseInt(match[1]);
                const freeGB = Math.round(freeBytes / (1024 * 1024 * 1024) * 10) / 10;
                diskInfo = {
                    free: freeGB,
                    freeBytes: freeBytes,
                    path: process.cwd(),
                    platform: 'win32'
                };
            }
        } else {
            // Use df for Unix-like systems
            const dfOutput = execSync(`df -h "${process.cwd()}"`, { encoding: 'utf8' });
            const lines = dfOutput.split('\n');
            const dataLine = lines[1];
            const columns = dataLine.split(/\s+/);
            
            // Parse available space (typically column 3)
            const availableStr = columns[3];
            let availableGB = 0;
            
            if (availableStr.endsWith('G')) {
                availableGB = parseFloat(availableStr.slice(0, -1));
            } else if (availableStr.endsWith('M')) {
                availableGB = parseFloat(availableStr.slice(0, -1)) / 1024;
            } else if (availableStr.endsWith('T')) {
                availableGB = parseFloat(availableStr.slice(0, -1)) * 1024;
            }
            
            diskInfo = {
                free: Math.round(availableGB * 10) / 10,
                freeStr: availableStr,
                total: columns[1],
                used: columns[2],
                filesystem: columns[0],
                path: process.cwd(),
                platform: platform
            };
        }
        
        return diskInfo;
    } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not detect disk space information'));
        return {
            free: 0,
            path: process.cwd(),
            platform: os.platform(),
            error: error.message
        };
    }
}

/**
 * Check GPU availability
 */
async function checkGPU() {
    const gpuInfo = {
        hasNvidia: false,
        hasMetal: false,
        hasOpenCL: false,
        details: [],
        recommendations: []
    };
    
    try {
        // Check for NVIDIA GPU
        try {
            const nvidiaOutput = execSync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits', { 
                encoding: 'utf8', 
                timeout: 5000 
            });
            
            gpuInfo.hasNvidia = true;
            const lines = nvidiaOutput.trim().split('\n');
            gpuInfo.details = lines.map(line => {
                const [name, memory] = line.split(', ');
                return {
                    type: 'nvidia',
                    name: name.trim(),
                    memory: parseInt(memory),
                    memoryGB: Math.round(parseInt(memory) / 1024 * 10) / 10
                };
            });
        } catch (error) {
            // nvidia-smi not available or no NVIDIA GPU
        }
        
        // Check for Metal (macOS)
        if (os.platform() === 'darwin') {
            try {
                const systemProfilerOutput = execSync('system_profiler SPDisplaysDataType', { 
                    encoding: 'utf8',
                    timeout: 10000 
                });
                
                if (systemProfilerOutput.includes('Metal')) {
                    gpuInfo.hasMetal = true;
                    
                    // Try to extract GPU info
                    const gpuMatches = systemProfilerOutput.match(/Chipset Model: (.+)/g);
                    if (gpuMatches) {
                        gpuMatches.forEach(match => {
                            const name = match.replace('Chipset Model: ', '').trim();
                            gpuInfo.details.push({
                                type: 'metal',
                                name: name,
                                memory: 'Shared', // Most Apple Silicon shares memory
                                capabilities: ['Metal', 'Neural Engine']
                            });
                        });
                    }
                }
            } catch (error) {
                // system_profiler failed
            }
        }
        
        // Check for OpenCL (general GPU compute)
        try {
            // This is a simple check - in practice, OpenCL detection is more complex
            const platform = os.platform();
            if (platform === 'linux') {
                try {
                    execSync('which clinfo', { timeout: 2000 });
                    const clinfoOutput = execSync('clinfo', { encoding: 'utf8', timeout: 5000 });
                    if (clinfoOutput.includes('Platform Name')) {
                        gpuInfo.hasOpenCL = true;
                    }
                } catch (error) {
                    // clinfo not available
                }
            }
        } catch (error) {
            // OpenCL detection failed
        }
        
    } catch (error) {
        // GPU detection failed
        gpuInfo.error = error.message;
    }
    
    // Generate recommendations
    if (gpuInfo.hasNvidia) {
        gpuInfo.recommendations.push('NVIDIA GPU detected - excellent for local AI models');
        gpuInfo.recommendations.push('Consider Ollama with CUDA acceleration for fastest performance');
    } else if (gpuInfo.hasMetal) {
        gpuInfo.recommendations.push('Apple Silicon detected - good for local AI with Metal acceleration');
        gpuInfo.recommendations.push('Ollama supports Metal acceleration on Apple Silicon');
    } else {
        gpuInfo.recommendations.push('No GPU acceleration detected - local models will use CPU only');
        gpuInfo.recommendations.push('Consider cloud-based AI for better performance');
    }
    
    return gpuInfo;
}

/**
 * Analyze system capabilities and generate recommendations
 */
function analyzeSystemCapabilities(systemInfo) {
    const { memory, disk, gpu } = systemInfo;
    const memoryGB = memory.total || 0;
    const diskFreeGB = disk.free || 0;
    
    // Memory-based decisions
    if (memoryGB < 8) {
        systemInfo.capabilities.cloudOnly = true;
        systemInfo.warnings.push(`Only ${memoryGB}GB RAM detected - cloud AI recommended`);
        systemInfo.recommendations.push('Cloud-based AI providers for best experience');
    } else if (memoryGB >= 16) {
        systemInfo.capabilities.canRunLocal = true;
        systemInfo.capabilities.recommendLocal = true;
        systemInfo.recommendations.push('Sufficient RAM for local AI models - consider Ollama');
    } else {
        // 8-15GB range
        systemInfo.capabilities.canRunLocal = true;
        systemInfo.recommendations.push('Local models possible but may be slower with limited RAM');
    }
    
    // Disk space warnings
    if (diskFreeGB < 10) {
        systemInfo.warnings.push(`Low disk space: ${diskFreeGB}GB free - minimum 10GB recommended`);
        systemInfo.recommendations.push('Free up disk space before installing large AI models');
    } else if (diskFreeGB < 50 && systemInfo.capabilities.canRunLocal) {
        systemInfo.warnings.push('Local AI models can be large (5-50GB) - monitor disk space');
    }
    
    // GPU recommendations
    if (gpu.hasNvidia && memoryGB >= 16) {
        systemInfo.recommendations.push('Excellent setup for local AI - NVIDIA GPU + sufficient RAM');
    } else if (gpu.hasMetal && memoryGB >= 16) {
        systemInfo.recommendations.push('Good setup for local AI - Apple Silicon with Metal acceleration');
    }
    
    // Platform-specific recommendations
    if (systemInfo.platform === 'darwin' && memoryGB >= 16) {
        systemInfo.recommendations.push('macOS + sufficient RAM - Ollama recommended for local models');
    } else if (systemInfo.platform === 'linux' && gpu.hasNvidia) {
        systemInfo.recommendations.push('Linux + NVIDIA - excellent for AI development');
    }
}

/**
 * Display system check results
 */
export function displaySystemCheck(systemInfo) {
    console.log(chalk.blue.bold('\n💻 System Analysis Results'));
    console.log('');
    
    // Memory info
    if (systemInfo.memory.total > 0) {
        const memoryColor = systemInfo.memory.total >= 16 ? 'green' : 
                           systemInfo.memory.total >= 8 ? 'yellow' : 'red';
        console.log(chalk[memoryColor](`📊 Memory: ${systemInfo.memory.total}GB RAM`));
        
        if (systemInfo.memory.platform === 'linux' && systemInfo.memory.available) {
            const availableGB = Math.round(systemInfo.memory.available / 1024 * 10) / 10;
            console.log(chalk.gray(`   Available: ${availableGB}GB`));
        } else if (systemInfo.memory.pressure) {
            const pressureColor = systemInfo.memory.pressure === 'normal' ? 'green' : 
                                 systemInfo.memory.pressure === 'warn' ? 'yellow' : 'red';
            console.log(chalk[pressureColor](`   Memory pressure: ${systemInfo.memory.pressure}`));
        }
    }
    
    // Disk space info
    if (systemInfo.disk.free > 0) {
        const diskColor = systemInfo.disk.free >= 50 ? 'green' : 
                         systemInfo.disk.free >= 10 ? 'yellow' : 'red';
        console.log(chalk[diskColor](`💾 Disk Space: ${systemInfo.disk.free}GB free`));
    }
    
    // GPU info
    if (systemInfo.gpu.details.length > 0) {
        console.log(chalk.green('🎮 GPU Acceleration:'));
        systemInfo.gpu.details.forEach(gpu => {
            if (gpu.type === 'nvidia') {
                console.log(chalk.green(`   • ${gpu.name} (${gpu.memoryGB}GB VRAM)`));
            } else if (gpu.type === 'metal') {
                console.log(chalk.green(`   • ${gpu.name} (Metal supported)`));
            }
        });
    } else {
        console.log(chalk.gray('🎮 GPU: CPU-only mode (no GPU acceleration detected)'));
    }
    
    console.log('');
    
    // Capabilities summary
    if (systemInfo.capabilities.cloudOnly) {
        console.log(chalk.yellow('🔧 Recommended Setup: Cloud AI only'));
        console.log(chalk.gray('   Local AI models not recommended with current hardware'));
    } else if (systemInfo.capabilities.recommendLocal) {
        console.log(chalk.green('🔧 Recommended Setup: Cloud + Local AI options available'));
        console.log(chalk.gray('   Your hardware can run local AI models effectively'));
    } else if (systemInfo.capabilities.canRunLocal) {
        console.log(chalk.yellow('🔧 Recommended Setup: Cloud preferred, Local possible'));
        console.log(chalk.gray('   Local AI models possible but may be slower'));
    }
    
    // Warnings
    if (systemInfo.warnings.length > 0) {
        console.log('');
        console.log(chalk.yellow('⚠️  System Warnings:'));
        systemInfo.warnings.forEach(warning => {
            console.log(chalk.yellow(`   • ${warning}`));
        });
    }
    
    // Recommendations
    if (systemInfo.recommendations.length > 0) {
        console.log('');
        console.log(chalk.blue('💡 Recommendations:'));
        systemInfo.recommendations.forEach(rec => {
            console.log(chalk.blue(`   • ${rec}`));
        });
    }
    
    console.log('');
}