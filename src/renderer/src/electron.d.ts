import type { AppConfig } from '@shared/appConfig';
import type { HardwareSettingsV1 } from '@shared/hardwareSettings';

export interface PosAppApi {
  getConfig(): Promise<AppConfig>;
  saveConfig(config: AppConfig): Promise<void>;
  getHardwareSettings(): Promise<HardwareSettingsV1>;
  saveHardwareSettings(settings: HardwareSettingsV1): Promise<void>;
  getLanAddresses(): Promise<string[]>;
  applyFirewallRule(port: number): Promise<{ ok: boolean; message: string }>;
  syncNow(): Promise<{ ok: boolean; error?: string }>;
  enqueueTestOutbox(): Promise<{ ok: boolean; id?: number }>;
}

declare global {
  interface Window {
    posapp?: PosAppApi;
  }
}
