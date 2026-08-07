import { createDefaultAppConfig, type AppConfig } from '@shared/appConfig';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function readConfigFile(configPath: string): Promise<AppConfig> {
  try {
    const raw = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as AppConfig;
    return { ...createDefaultAppConfig(), ...parsed };
  } catch {
    return createDefaultAppConfig();
  }
}

export async function writeConfigFile(configPath: string, config: AppConfig): Promise<void> {
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function paths(userData: string) {
  return {
    config: join(userData, 'config.json'),
    hardware: join(userData, 'settings.v1.json'),
    database: join(userData, 'posapp.db'),
  };
}
