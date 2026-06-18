# @dlbr/cli

The official Command Line Interface for the DLBR Fiscalization and e-Invoicing Edge Infrastructure.

The DLBR CLI provides deterministic, typed execution of fiscal receipts, invoice drafting, and tenant management natively from your terminal.

## Installation

You can run the CLI directly via `npx`, or install it globally for native autocomplete and instant access:

```bash
# Run without installing
npx @dlbr/cli help

# Install globally
npm install -g @dlbr/cli
```

## Authentication

All interactions with the API require an authenticated session. The DLBR CLI does **not** rely on static sandbox keys or hardcoded tokens.

1. Generate an API Key from your workspace dashboard.
2. Run the login command:

```bash
dlbr auth login
# You will be securely prompted to paste your token
```

You can also bypass the prompt in CI/CD environments by passing the token explicitly:

```bash
dlbr auth login --token <your_token>
```

Check your active identity:

```bash
dlbr auth whoami
```

## Shell Autocomplete (Zero-Latency)

The DLBR CLI supports instant, native terminal autocomplete for both `zsh` and `bash`. Because the autocomplete hook evaluates natively, it introduces zero Node.js startup penalty when hitting `Tab`.

### Zsh

Add the following to your `~/.zshrc`:

```bash
eval "$(dlbr completion zsh)"
```

### Bash

Add the following to your `~/.bashrc`:

```bash
eval "$(dlbr completion bash)"
```

Once reloaded, typing `dlbr [Tab]` will instantly list available commands and their descriptions without falling back to local file parsing.

## Commands

### Authentication
Authenticate and manage your identity.
- `dlbr login` - Authenticate with the DLBR SEF API
- `dlbr me` (or `dlbr whoami`) - Display information about the current authenticated session

### Fiscalization
Manage Fiscalization transactions.
- `dlbr fiscal status <transactionId>` - Check the status of a POS transaction
- `dlbr fiscal list` - List fiscal receipts from the internal ledger

### Invoicing
Manage SEF invoices.
- `dlbr invoice status <id>` - Check the SEF status of an invoice by its ID
- `dlbr invoice list` - List invoices from the internal registry

### Workspaces
Manage active workspace configuration.
- `dlbr workspace set <id>` - Set the active workspace ID
- `dlbr workspace get` - Get the currently configured active workspace ID

### Archive
Manage UBL/SEF document storage.
- `dlbr archive list` - List archived documents
- `dlbr archive put <filePath>` - Upload a document to the archive
- `dlbr archive get <fileId>` - Download an archived document

## Configuration & Environments

By default, the CLI points to `https://api.dlbr.cloud`. For local development or isolated staging environments, you can override the base endpoint via environment variables:

```bash
DLBR_API_URL=http://localhost:8787 dlbr auth whoami
```

## Architecture & Security

The DLBR CLI treats the client environment as hostile. It performs **zero** offline validation or local financial calculations. It exists purely as a highly optimized presentation and transport layer. 

All role-based access control, cryptographic unsealing, and transaction sequencing guarantees are securely enforced at the Cloudflare Edge and D1/R2 layer.

## License

MIT © DLBR
