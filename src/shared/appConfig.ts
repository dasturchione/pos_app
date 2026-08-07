export type AppMode = 'SERVER_AND_POS' | 'POS_ONLY';

export interface AppConfig {
  setupCompleted: boolean;
  mode: AppMode;
  serverPort: number;
  serverHostUrl: string;
  syncAuthSecret: string;
  locale?: string;
  shopName?: string;
}

export const DEFAULT_SERVER_PORT = 3847;

export function createDefaultAppConfig(): AppConfig {
  return {
    setupCompleted: false,
    mode: 'SERVER_AND_POS',
    serverPort: DEFAULT_SERVER_PORT,
    serverHostUrl: `http://127.0.0.1:${DEFAULT_SERVER_PORT}`,
    syncAuthSecret: '',
    locale: 'uz',
    shopName: '',
  };
}
