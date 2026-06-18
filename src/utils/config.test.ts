import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readConfig, writeConfig, getConfigDir, getConfigFile } from './config';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

vi.mock('node:fs/promises');
vi.mock('node:os');

describe('config utils', () => {
  const mockHomeDir = '/mock/home';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.spyOn(os, 'homedir').mockReturnValue(mockHomeDir);
    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    delete process.env.XDG_CONFIG_HOME;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetAllMocks();
  });

  it('getConfigDir returns correct path based on homedir', async () => {
    const dir = await getConfigDir();
    expect(dir).toBe(path.join(mockHomeDir, '.config', 'dlbr-sef'));
    expect(fs.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
  });

  it('getConfigDir respects XDG_CONFIG_HOME', async () => {
    process.env.XDG_CONFIG_HOME = '/custom/config';
    const dir = await getConfigDir();
    expect(dir).toBe(path.join('/custom/config', 'dlbr'));
  });

  it('readConfig returns parsed JSON if file exists', async () => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({ token: 'test-token' }));
    const config = await readConfig();
    expect(config).toEqual({ token: 'test-token' });
  });

  it('readConfig returns empty object if file does not exist (ENOENT)', async () => {
    vi.spyOn(fs, 'readFile').mockRejectedValue({ code: 'ENOENT' });
    const config = await readConfig();
    expect(config).toEqual({});
  });

  it('writeConfig merges with existing config', async () => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({ workspaceId: 'ws-123' }));
    await writeConfig({ token: 'new-token' });
    const file = await getConfigFile();
    expect(fs.writeFile).toHaveBeenCalledWith(
      file,
      JSON.stringify({ workspaceId: 'ws-123', token: 'new-token' }, null, 2),
      'utf-8'
    );
  });
});
