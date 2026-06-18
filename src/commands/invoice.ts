import { Command } from 'commander';
import { request } from '../utils/api.js';
import { red, green, bold, dim, yellow, gray } from 'yoctocolors';
import ora from 'ora';
import type { InvoiceListResponse, InvoiceStatusResponse } from '@dlbr/shared';

export function registerInvoiceCommands(program: Command): void {
  const invoiceCmd = program
    .command('invoice')
    .description(gray('Manage SEF invoices'));

  invoiceCmd
    .command('status <id>')
    .description(gray('Check the SEF status of an invoice by its ID'))
    .option('--json', 'Output results in JSON format')
    .action(async (id: string, options: { json?: boolean }): Promise<void> => {
      try {
        const result = await request<InvoiceStatusResponse>(`/public/sef/invoice-status/${id}`);
        
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`\n${green('=== SEF Invoice Status ===')}`);
        console.log(`${bold('ID:')}        ${result.id}`);
        console.log(`${bold('Broj:')}      ${result.broj}`);
        console.log(`${bold('Status:')}    ${bold(yellow(result.status))}`);
        if (result.sefId) {
          console.log(`${bold('SEF ID:')}    ${result.sefId}`);
        }
        if (result.poruka) {
          console.log(`${bold('Message:')}   ${dim(result.poruka)}`);
        }
        console.log();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          console.error(JSON.stringify({ success: false, error: errorMessage }));
        } else {
          console.error(`${red('❌ Error:')} ${errorMessage}`);
        }
        process.exitCode = 1;
      }
    });

  invoiceCmd
    .command('list')
    .description(gray('List invoices from the internal registry'))
    .option('--direction <direction>', 'Direction of invoices (OUTBOUND or INBOUND)', 'OUTBOUND')
    .option('--page <page>', 'Page number', '1')
    .option('--limit <limit>', 'Number of items per page', '10')
    .option('--status <status>', 'Filter by status (e.g. SVI, SENT, APPROVED)', 'SVI')
    .option('--json', 'Output results in JSON format')
    .action(async (options: { direction: string; page: string; limit: string; status: string; json?: boolean }): Promise<void> => {
      try {
        const queryParams = new URLSearchParams({
          smer: options.direction,
          page: options.page,
          limit: options.limit,
          status: options.status,
        });

        const result = await request<InvoiceListResponse>(`/internal/fakture/lista-izlaznih?${queryParams.toString()}`);
        
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`\n${green(`=== Invoices Registry List (Page ${options.page}) ===`)}`);
        if (!result.data || result.data.length === 0) {
          console.log(dim('No invoices found in this page.'));
          console.log();
          return;
        }

        result.data.forEach((inv, idx) => {
          console.log(`${bold(`${idx + 1}.`)} ${bold('Broj:')} ${inv.broj} | ${bold('Partner:')} ${inv.partner_naziv}`);
          console.log(`   ${bold('Iznos:')}     ${inv.iznos} ${inv.valuta}`);
          console.log(`   ${bold('Status:')}    ${yellow(inv.status)}`);
          console.log(`   ${bold('Updated:')}   ${dim(inv.azurirano)}`);
          console.log();
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.json) {
          console.error(JSON.stringify({ success: false, error: errorMessage }));
        } else {
          console.error(`${red('❌ Error:')} ${errorMessage}`);
        }
        process.exitCode = 1;
      }
    });
}
