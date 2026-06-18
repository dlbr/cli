import { Command } from 'commander';

const BASH_SCRIPT = `
_dlbr_completions() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  case "\${prev}" in
    dlbr)
      opts="login me whoami invoice invoices fiscal workspace archive completion help"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    invoice|invoices)
      opts="status list"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    fiscal)
      opts="status list"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    workspace)
      opts="set get"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    archive)
      opts="list put get"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    *)
      ;;
  esac
}

complete -F _dlbr_completions dlbr
`;

const ZSH_SCRIPT = `
# Clear out any default file-completion falling back on this command name
compdef -d dlbr 2>/dev/null

_dlbr_completion() {
  local context state state_descr line
  typeset -A opt_args

  # The core arguments matrix for Zsh
  _arguments -C \\
    '1: :->command' \\
    '*:: :->args'

  case $state in
    command)
      local -a subcommands
      subcommands=(
        'login:Authenticate with the DLBR SEF API'
        'me:Display information about current authenticated session'
        'whoami:Alias for me'
        'invoice:Manage SEF invoices'
        'invoices:Alias for invoice'
        'fiscal:Manage Fiscalization transactions'
        'workspace:Manage active workspace configuration'
        'archive:Manage UBL/SEF document storage'
        'completion:Generate shell completion script'
        'help:Show help'
      )
      _describe -t subcommands 'dlbr commands' subcommands && return 0
      ;;
    args)
      case $words[1] in
        invoice|invoices)
          local -a invoice_subcommands
          invoice_subcommands=(
            'status:Check the SEF status of an invoice by its ID'
            'list:List invoices from the internal registry'
          )
          _describe -t invoice_subcommands 'invoice subcommands' invoice_subcommands && return 0
          ;;
        fiscal)
          local -a fiscal_subcommands
          fiscal_subcommands=(
            'status:Check the status of a POS transaction'
            'list:List fiscal receipts from the internal ledger'
          )
          _describe -t fiscal_subcommands 'fiscal subcommands' fiscal_subcommands && return 0
          ;;
        workspace)
          local -a workspace_subcommands
          workspace_subcommands=(
            'set:Set the active workspace ID'
            'get:Get the currently configured active workspace ID'
          )
          _describe -t workspace_subcommands 'workspace subcommands' workspace_subcommands && return 0
          ;;
        archive)
          local -a archive_subcommands
          archive_subcommands=(
            'list:List archived documents'
            'put:Upload a document to the archive'
            'get:Download an archived document'
          )
          _describe -t archive_subcommands 'archive subcommands' archive_subcommands && return 0
          ;;
        *)
          # If no subcommand matches, do NOT fall back to files
          _message "no more arguments allowed"
          return 1
          ;;
      esac
      ;;
  esac
}

# This forces Zsh to link the command name directly to our function instantly
compdef _dlbr_completion dlbr
`;

export function registerCompletionCommand(program: Command) {
  program
    .command('completion')
    .description('Generate shell completion script')
    .argument('[shell]', 'Shell type (bash or zsh)', 'zsh')
    .action((shell: string) => {
      if (shell === 'bash') {
        console.log(BASH_SCRIPT);
      } else if (shell === 'zsh') {
        console.log(ZSH_SCRIPT);
      } else {
        console.error('Unsupported shell. Use "bash" or "zsh".');
        process.exit(1);
      }
    });
}
