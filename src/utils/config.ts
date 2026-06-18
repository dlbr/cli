import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface CLIConfig {
  token?: string;
  workspaceId?: string;
}

export async function getConfigDir(): Promise<string> {
  const home = os.homedir();
  const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
  const configDir = path.join(xdgConfigHome, 'dlbr');

  await fs.mkdir(configDir, { recursive: true });
  return configDir;
}

export async function getConfigFile(): Promise<string> {
  const dir = await getConfigDir();
  return path.join(dir, 'config.json');
}

export async function readConfig(): Promise<CLIConfig> {
  try {
    const file = await getConfigFile();
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data) as CLIConfig;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export async function writeConfig(config: CLIConfig): Promise<void> {
  const file = await getConfigFile();
  const existingConfig = await readConfig();
  const newConfig = { ...existingConfig, ...config };
  await fs.writeFile(file, JSON.stringify(newConfig, null, 2), 'utf-8');
}
