import { Command } from 'commander';
import { writeConfig, readConfig } from '../utils/config.js';

export function registerWorkspaceCommands(program: Command): void {
  const workspaceCmd = program
    .command('workspace')
    .description('Manage active workspace configuration');

  workspaceCmd
    .command('set <id>')
    .description('Set the active workspace ID')
    .action(async (id: string) => {
      try {
        await writeConfig({ workspaceId: id });
        console.log(`✅ Active workspace set to: ${id}`);
      } catch (error: unknown) {
        console.error(`❌ Failed to set workspace: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  workspaceCmd
    .command('get')
    .description('Get the currently configured active workspace ID')
    .action(async () => {
      const config = await readConfig();
      if (config.workspaceId) {
        console.log(`Current active workspace: ${config.workspaceId}`);
      } else {
        console.log('No active workspace configured.');
      }
    });
}
