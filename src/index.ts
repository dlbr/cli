import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerInvoiceCommands } from './commands/invoice.js';
import { registerFiscalCommands } from './commands/fiscal.js';
import { registerWorkspaceCommands } from './commands/workspace.js';
import { registerArchiveCommands } from './commands/archive.js';
import { registerCompletionCommand } from './commands/completion.js';

const program = new Command();

program
  .name('dlbr')
  .description('DLBR Command Line Interface')
  .version('1.0.0')
  .exitOverride((err) => {
    throw err;
  });

// Register subcommands
registerAuthCommands(program);
registerInvoiceCommands(program);
registerFiscalCommands(program);
registerWorkspaceCommands(program);
registerArchiveCommands(program);
registerCompletionCommand(program);

// Handle unknown commands gracefully instead of crashing
program.on('command:*', function (operands: string[]) {
  console.error(`❌ Invalid command: ${operands.join(' ')}\n`);
  program.help();
  process.exit(1);
});

// Parse the arguments
program.parse(process.argv);

// Show help if no arguments are provided
if (!process.argv.slice(2).length) {
  program.help();
}
