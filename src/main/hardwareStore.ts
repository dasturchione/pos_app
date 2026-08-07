import { defaultHardwareSettings, type HardwareSettingsV1 } from '@shared/hardwareSettings';
import { readFile, writeFile } from 'node:fs/promises';

export async function readHardware(path: string): Promise<HardwareSettingsV1> {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as HardwareSettingsV1;
  } catch {
    return defaultHardwareSettings();
  }
}

export async function writeHardware(path: string, settings: HardwareSettingsV1): Promise<void> {
  await writeFile(path, JSON.stringify(settings, null, 2), 'utf-8');
}
