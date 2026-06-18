import { Command } from 'commander';
import { request } from '../utils/api.js';
import { red, green, bold, dim, yellow } from 'yoctocolors';
import ora from 'ora';
import type { FiscalReceipt, FiscalListResponse, POSStatusResponse } from '@dlbr/shared';

export function registerFiscalCommands(program: Command): void {
  const fiscalCmd = program
    .command('fiscal')
    .description(dim('Manage Fiscalization transactions'));

  fiscalCmd
    .command('status <transactionId>')
    .description(dim('Check the status of a POS transaction'))
    .option('--json', 'Output results in JSON format')
    .action(async (transactionId: string, options: { json?: boolean }): Promise<void> => {
      if (!/^[a-zA-Z0-9-_]+$/.test(transactionId)) {
        console.error(`${red('Error:')} Invalid transaction ID format.`);
        process.exitCode = 2;
        return;
      }

      const spinner = !options.json ? ora(`Fetching fiscal status for ${bold(transactionId)}...`).start() : null;

      try {
        const result = await request<POSStatusResponse>(`/v1/fiscal/status/${transactionId}`);
        
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        spinner?.succeed('Data retrieved successfully.');
        renderHumanReadableStatus(transactionId, result.data);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          spinner?.stop();
          console.error(JSON.stringify({ success: false, error: errorMessage }));
        } else {
          spinner?.fail('Failed to fetch fiscal status.');
          console.error(`\n${red(bold('✕ Error:'))} ${errorMessage}`);
        }
        process.exitCode = 1;
      }
    });

  fiscalCmd
    .command('list')
    .description(dim('List fiscal receipts from the internal ledger'))
    .option('--limit <limit>', 'Maximum number of records to return', '10')
    .option('--offset <offset>', 'Number of records to skip', '0')
    .option('--search <query>', 'Search by PFR number or internal invoice ID')
    .option('--json', 'Output results in JSON format')
    .action(async (options: { limit: string; offset: string; search?: string; json?: boolean }): Promise<void> => {
      const spinner = !options.json ? ora('Fetching fiscal receipts...').start() : null;
      try {
        const queryParams = new URLSearchParams({
          limit: options.limit,
          offset: options.offset,
        });
        if (options.search) {
          queryParams.set('search', options.search);
        }

        const result = await request<FiscalListResponse>(`/internal/fiscal/list?${queryParams.toString()}`);
        
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        spinner?.succeed('Receipts retrieved successfully.');
        renderHumanReadableList(result.data, parseInt(options.offset, 10));

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          spinner?.stop();
          console.error(JSON.stringify({ success: false, error: errorMessage }));
        } else {
          spinner?.fail('Failed to fetch fiscal receipts.');
          console.error(`\n${red(bold('✕ Error:'))} ${errorMessage}`);
        }
        process.exitCode = 1;
      }
    });
}

function renderHumanReadableStatus(id: string, data: POSStatusResponse['data']): void {
  const statusColor = data.status === 'COMPLETED' ? green : data.status === 'FAILED' ? red : yellow;
  
  console.log(`\n${green('=== Fiscal POS Transaction Status ===')}`);
  console.log(`${bold('ID:')}                    ${id}`);
  console.log(`${bold('Status:')}                ${statusColor(bold(data.status))}`);
  console.log(`${bold('Updated At:')}            ${dim(data.updated_at)}`);
  if (data.sef_advance_invoice_id) {
    console.log(`${bold('SEF Advance Invoice:')}   ${data.sef_advance_invoice_id}`);
  }
  if (data.sef_final_invoice_id) {
    console.log(`${bold('SEF Final Invoice:')}     ${data.sef_final_invoice_id}`);
  }
  console.log();
}

function renderHumanReadableList(receipts: readonly FiscalReceipt[], offset: number): void {
  console.log(`\n${green('=== Fiscal Receipts List ===')}`);
  if (receipts.length === 0) {
    console.log(dim('No fiscal receipts found.'));
    console.log();
    return;
  }

  receipts.forEach((r, idx) => {
    const itemNum = offset + idx + 1;
    const statusColor = r.status === 'SUCCESS' ? green : r.status === 'FAILED' ? red : yellow;
    
    console.log(`${bold(`${itemNum}.`)} ${bold('PFR Broj:')} ${r.pfr_broj || dim('N/A')} [${statusColor(r.status)}]`);
    console.log(`   ${bold('ID:')}        ${r.id}`);
    if (r.interni_id_fakture) {
      console.log(`   ${bold('Invoice:')}   ${r.interni_id_fakture}`);
    }
    console.log(`   ${bold('Time:')}      ${dim(r.fiskalizovano_u)}`);
    console.log();
  });
}
