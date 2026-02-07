#!/usr/bin/env node

/**
 * OpenClaw Setup Agent CLI Entry Point
 * 
 * This is the main CLI entry point that users invoke with `npx openclaw-setup`
 * or `openclaw-setup` when installed globally.
 */

import { program } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        // Dynamic import of the main module (ES modules)
        const { setupAgent } = await import(path.join(__dirname, '../src/index.js'));
        
        // Setup commander program
        program
            .name('openclaw-setup')
            .description('AI-powered setup assistant for OpenClaw')
            .version('1.0.0-beta.1')
            .action(setupAgent);
            
        // Add help examples
        program.addHelpText('after', `
Examples:
  $ openclaw-setup              # Start interactive setup
  $ npx openclaw-setup          # Run without installing globally
  
Need help? Visit https://kingos.net/docs/openclaw-setup-agent
`);

        // Parse CLI arguments
        await program.parseAsync();
        
    } catch (error) {
        console.error('❌ Failed to start OpenClaw Setup Agent:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Handle unhandled rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the CLI
main();