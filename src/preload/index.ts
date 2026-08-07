import type { AppConfig } from '@shared/appConfig';
import type { HardwareSettingsV1 } from '@shared/hardwareSettings';
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('posapp:getConfig'),
  saveConfig: (config: AppConfig): Promise<void> => ipcRenderer.invoke('posapp:saveConfig', config),
  getHardwareSettings: (): Promise<HardwareSettingsV1> =>
    ipcRenderer.invoke('posapp:getHardwareSettings'),
  saveHardwareSettings: (settings: HardwareSettingsV1): Promise<void> =>
    ipcRenderer.invoke('posapp:saveHardwareSettings', settings),
  getLanAddresses: (): Promise<string[]> => ipcRenderer.invoke('posapp:getLanAddresses'),
  applyFirewallRule: (port: number): Promise<{ ok: boolean; message: string }> =>
    ipcRenderer.invoke('posapp:applyFirewallRule', port),
  syncNow: (): Promise<{ ok: boolean; error?: string }> => ipcRenderer.invoke('posapp:syncNow'),
  enqueueTestOutbox: (): Promise<{ ok: boolean; id?: number }> =>
    ipcRenderer.invoke('posapp:enqueueTestOutbox'),
};

contextBridge.exposeInMainWorld('posapp', api);
