import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerAuthCommands } from './auth';
import * as configUtils from '../utils/config';
import * as inquirerPrompts from '@inquirer/prompts';

vi.mock('../utils/config');
vi.mock('@inquirer/prompts');

describe('auth commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride(); // Prevent process.exit in tests
    program.configureOutput({
      writeOut: () => {},
      writeErr: () => {}
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(configUtils, 'writeConfig').mockResolvedValue(undefined);
    vi.spyOn(inquirerPrompts, 'password').mockResolvedValue('mocked-token');
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('registers the login command', () => {
    registerAuthCommands(program);
    const loginCmd = program.commands.find(c => c.name() === 'login');
    expect(loginCmd).toBeDefined();
  });

  it('prompts for token if not provided via flags', async () => {
    registerAuthCommands(program);
    await program.parseAsync(['node', 'test', 'login']);
    
    expect(inquirerPrompts.password).toHaveBeenCalled();
    expect(configUtils.writeConfig).toHaveBeenCalledWith({ token: 'mocked-token' });
  });

  it('fails if --json is used without a token flag', async () => {
    registerAuthCommands(program);
    await expect(program.parseAsync(['node', 'test', 'login', '--json'])).rejects.toThrow();
  });

  it('calls writeConfig and outputs success message when token is provided', async () => {
    registerAuthCommands(program);
    await program.parseAsync(['node', 'test', 'login', '--token', 'my-token']);
    
    expect(inquirerPrompts.password).not.toHaveBeenCalled();
    expect(configUtils.writeConfig).toHaveBeenCalledWith({ token: 'my-token' });
    expect(console.log).toHaveBeenCalledWith('✅ Successfully authenticated! Your token has been securely stored.');
  });

  it('outputs JSON when --json flag is used', async () => {
    registerAuthCommands(program);
    await program.parseAsync(['node', 'test', 'login', '--token', 'my-token', '--json']);
    
    expect(configUtils.writeConfig).toHaveBeenCalledWith({ token: 'my-token' });
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ 
      success: true, 
      message: 'Successfully authenticated' 
    }));
  });
  
  it('outputs error JSON on failure when --json is used', async () => {
    vi.spyOn(configUtils, 'writeConfig').mockRejectedValue(new Error('File system error'));
    
    registerAuthCommands(program);
    await expect(program.parseAsync(['node', 'test', 'login', '--token', 'my-token', '--json'])).rejects.toThrow();
    
    expect(console.error).toHaveBeenCalledWith(JSON.stringify({ 
      success: false, 
      error: 'File system error' 
    }));
  });
});
