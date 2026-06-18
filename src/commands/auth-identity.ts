import { Command } from 'commander';
import { request } from '../utils/api.js';
import { readConfig } from '../utils/config.js';
import { green, bold, dim, cyan, gray } from 'yoctocolors';

interface WhoAmIResponse {
  success: boolean;
  accountId: string;
  email: string;
  globalnaUloga: string;
  status: string;
}

export function registerAuthCommands(program: Command): void {
  // We already have login here, but let's keep it organized

  program
    .command('me')
    .description(gray('Display information about the current authenticated session'))
    .option('--json', gray('Output results in JSON format'))
    .action(async (options: { json?: boolean }): Promise<void> => {
      try {
        const config = await readConfig();
        const result = await request<WhoAmIResponse>('/auth/session');

        if (options.json) {
          console.log(JSON.stringify({
            ...result,
            activeWorkspaceId: config.workspaceId || null
          }, null, 2));
          return;
        }

        console.log(`\n${green('=== Authenticated Identity ===')}`);
        console.log(`${bold('Email:')}             ${cyan(result.email)}`);
        console.log(`${bold('Role:')}              ${result.globalnaUloga}`);
        console.log(`${bold('Status:')}            ${result.status === 'active' ? green('ACTIVE') : result.status}`);
        console.log(`${bold('Account ID:')}        ${dim(result.accountId)}`);

        if (config.workspaceId) {
          console.log(`${bold('Active Workspace:')}  ${cyan(config.workspaceId)}`);
        } else {
          console.log(`${bold('Active Workspace:')}  ${dim('None configured. Use `dlbr workspace set <id>`')}`);
        }
        console.log();

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          console.error(JSON.stringify({ success: false, error: errorMessage }));
        } else {
          console.error(`\n${bold('❌ Error:')} ${errorMessage}`);
          console.log(dim('Try logging in again with `dlbr login`'));
        }
        process.exitCode = 1;
      }
    });
}
