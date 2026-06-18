import { Command } from 'commander';
import { request } from '../utils/api.js';
import { red, green, bold, dim, yellow } from 'yoctocolors';
import ora from 'ora';
import fs from 'node:fs/promises';
import path from 'node:path';

export function registerDocumentCommands(program: Command): void {
  const documentCmd = program
    .command('document')
    .description(dim('Manage UBL/SEF document storage'));

  documentCmd
    .command('list')
    .description(dim('List stored documents'))
    .option('--json', 'Output results in JSON format')
    .action(async (options: { json?: boolean }) => {
      const spinner = !options.json ? ora('Fetching archive list...').start() : null;
      try {
        const result = await request<any>('/internal/storage/lista');
        
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        spinner?.succeed('Archives retrieved.');
        console.log(`\n${green('=== Archived Documents ===')}`);
        // Adjust display based on actual response structure
        console.log(result);
      } catch (e: any) {
        spinner?.fail('Failed to list archives.');
        console.error(`${red('Error:')} ${e.message}`);
        process.exitCode = 1;
      }
    });

  documentCmd
    .command('put <filePath>')
    .description(dim('Upload a document to storage'))
    .option('--folder <folderId>', 'Folder ID')
    .option('--category <cat>', 'Category', 'ostalo')
    .action(async (filePath: string, options: { folder?: string; category: string }) => {
      const spinner = ora('Uploading document...').start();
      try {
        const fullPath = path.resolve(filePath);
        const fileContent = await fs.readFile(fullPath);
        const fileName = path.basename(fullPath);

        const headers = new Headers();
        headers.set('X-File-Name', encodeURIComponent(fileName));
        headers.set('X-Kategorija', options.category);
        if (options.folder) headers.set('X-Folder-ID', options.folder);

        await request('/internal/storage/upload', {
          method: 'POST',
          headers,
          body: fileContent
        });

        spinner.succeed(`File ${bold(fileName)} uploaded successfully.`);
      } catch (e: any) {
        spinner.fail('Upload failed.');
        console.error(`${red('Error:')} ${e.message}`);
        process.exitCode = 1;
      }
    });

  documentCmd
    .command('get <fileId>')
    .description(dim('Download a stored document'))
    .action(async (fileId: string) => {
      const spinner = ora('Downloading...').start();
      try {
        // Note: The preuzmi endpoint returns the content or redirect, might need raw fetch
        const result = await request<any>(`/internal/storage/preuzmi?id=${fileId}`);
        spinner.succeed('Document data ready.');
        console.log(result);
      } catch (e: any) {
        spinner.fail('Download failed.');
        console.error(`${red('Error:')} ${e.message}`);
        process.exitCode = 1;
      }
    });
}
