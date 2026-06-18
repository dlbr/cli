import { Command } from 'commander';
import { writeConfig, readConfig } from '../utils/config.js';
import { request } from '../utils/api.js';
import { password } from '@inquirer/prompts';
import { green, bold, dim, cyan, gray, red } from 'yoctocolors';

interface WhoAmIResponse {
  success: boolean;
  accountId: string;
  email: string;
  globalnaUloga: string;
  status: string;
}

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description(gray('Authenticate with the DLBR SEF API'))
    .option('-t, --token <token>', gray('API Token (e.g. from the dashboard)'))
    .option('--json', gray('Output results in JSON format'))
    .action(async (options: { token?: string; json?: boolean }) => {
      try {
        let token = options.token;

        if (!token) {
          if (options.json) {
            throw new Error('Token must be provided via --token when using --json flag.');
          }
          token = await password({
            message: 'Paste your API Token:',
            mask: '*',
            validate: (input) => input.length > 0 || 'Token cannot be empty.',
          });
        }

        await writeConfig({ token });

        if (options.json) {
          console.log(JSON.stringify({
            success: true,
            message: 'Successfully authenticated'
          }));
        } else {
          console.log(`✅ Successfully authenticated! Token ${dim('******')} has been securely stored.`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          console.error(JSON.stringify({
            success: false,
            error: errorMessage
          }));
        } else {
          console.error(`${red('❌ Authentication failed:')} ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }
    });

  program
    .command('whoami')
    .description(gray('Display information about the current authenticated session'))
    .option('--json', gray('Output results in JSON format'))
    .action(async (options: { json?: boolean }): Promise<void> => {
      try {
        const config = await readConfig();
        const result = await request<WhoAmIResponse>('/internal/auth/session');

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
          console.error(`\n${red(bold('❌ Error:'))} ${errorMessage}`);
          console.log(dim('Try logging in again with `dlbr login`'));
        }
        process.exitCode = 1;
      }
    });
}
