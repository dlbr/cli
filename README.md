# @dlbr/cli

The official Command Line Interface for the DLBR Fiscalization and e-Invoicing Edge Infrastructure.

DLBR CLI is a Titanium-grade, edge-native terminal tool designed for zero-latency interaction with your workspaces. It provides deterministic, typed execution of fiscal receipts, invoice drafting, and tenant management natively from your terminal.

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

### Fiscalization

Manage high-throughput fiscal transactions directly from your terminal.

- `dlbr fiscal receipt` - Issue a new fiscal receipt.
- `dlbr fiscal z-report` - Issue a Z report.
- `dlbr fiscal x-report` - Issue an X report.

### Invoicing

Manage electronic invoices (e-Fakture).

- `dlbr invoice list` - List recent invoices.
- `dlbr invoice send` - Send an invoice.
- `dlbr invoice draft` - Create an invoice draft.
- `dlbr invoice view` - View specific invoice details.

### Workspaces

Tenant and environment management.

- `dlbr workspace list` - List available workspaces.
- `dlbr workspace switch` - Switch your active workspace context.
- `dlbr workspace info` - View configuration and active context data.

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
