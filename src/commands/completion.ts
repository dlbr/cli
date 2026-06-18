import { Command } from 'commander';

const BASH_SCRIPT = `
_dlbr_completions() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  case "\${prev}" in
    dlbr)
      opts="auth invoice fiscal workspace completion help"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    auth)
      opts="login logout status whoami session"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    invoice)
      opts="list send view draft"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    fiscal)
      opts="receipt z-report x-report"
      COMPREPLY=( $(compgen -W "\${opts}" -- "\${cur}") )
      return 0
      ;;
    workspace)
      opts="list switch info"
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
        'auth:Authentication and identity'
        'invoice:Manage invoices'
        'fiscal:Fiscal operations'
        'workspace:Workspace management'
        'completion:Generate shell completion script'
        'help:Show help'
      )
      _describe -t subcommands 'dlbr commands' subcommands && return 0
      ;;
    args)
      case $words[1] in
        auth)
          local -a auth_subcommands
          auth_subcommands=(
            'login:Login to DLBR'
            'logout:Logout'
            'status:Check auth status'
            'whoami:Check your current active identity'
            'session:Print current session'
          )
          _describe -t auth_subcommands 'auth subcommands' auth_subcommands && return 0
          ;;
        invoice)
          local -a invoice_subcommands
          invoice_subcommands=(
            'list:List recent invoices'
            'send:Send an invoice'
            'view:View an invoice'
            'draft:Draft an invoice'
          )
          _describe -t invoice_subcommands 'invoice subcommands' invoice_subcommands && return 0
          ;;
        fiscal)
          local -a fiscal_subcommands
          fiscal_subcommands=(
            'receipt:Issue a fiscal receipt'
            'z-report:Issue a Z report'
            'x-report:Issue an X report'
          )
          _describe -t fiscal_subcommands 'fiscal subcommands' fiscal_subcommands && return 0
          ;;
        workspace)
          local -a workspace_subcommands
          workspace_subcommands=(
            'list:List workspaces'
            'switch:Switch workspace'
            'info:Workspace information'
          )
          _describe -t workspace_subcommands 'workspace subcommands' workspace_subcommands && return 0
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
