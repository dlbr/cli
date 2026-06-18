import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerInvoiceCommands } from './commands/invoice.js';
import { registerFiscalCommands } from './commands/fiscal.js';
import { registerWorkspaceCommands } from './commands/workspace.js';
import { registerDocumentCommands } from './commands/document.js';
import { registerCompletionCommand } from './commands/completion.js';
import { reportMetric } from './utils/telemetry.js';
import { red, bold } from 'yoctocolors';

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
registerDocumentCommands(program);
registerCompletionCommand(program);

// Handle unknown commands gracefully
program.on('command:*', function (operands: string[]) {
  reportMetric(operands[0], 'FAILED', 'INVALID_COMMAND');
  console.error(`❌ Invalid command: ${operands.join(' ')}\n`);
  program.help();
  process.exit(1);
});

async function run() {
  try {
    await program.parseAsync(process.argv);
    const cmd = program.args[0] || 'help';
    if (cmd !== 'help') reportMetric(cmd, 'SUCCESS');
  } catch (error: any) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.help') {
      process.exit(0);
    }
    
    const msg = error instanceof Error ? error.message : String(error);
    const cmd = program.args[0] || 'unknown';
    
    reportMetric(cmd, 'FAILED', msg);
    console.error(`\n${red(bold('Internal Error:'))} ${msg}`);
    process.exit(1);
  }
}

run();
