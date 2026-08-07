export type PrinterConnection = 'usb' | 'network' | 'com';

export interface PrinterSettings {
  enabled: boolean;
  name: string;
  connection: PrinterConnection;
  address: string;
  paperWidthMm: number;
}

export type ScannerMode = 'keyboard_wedge' | 'serial' | 'camera';

export interface ScannerSettings {
  enabled: boolean;
  mode: ScannerMode;
  comPort?: string;
  baudRate?: number;
  terminator?: string;
  cameraFrameRate?: number;
  cameraResolution?: string;
}

export interface ScaleSettings {
  enabled: boolean;
  model: string;
  comPort: string;
  baudRate: number;
  prefix: string;
  suffix: string;
  unit: 'kg' | 'g' | 'lb';
}

export interface HardwareSettingsV1 {
  version: 1;
  printer: PrinterSettings;
  scanner: ScannerSettings;
  scale: ScaleSettings;
}

export function defaultHardwareSettings(): HardwareSettingsV1 {
  return {
    version: 1,
    printer: {
      enabled: false,
      name: 'Receipt',
      connection: 'network',
      address: '192.168.1.100:9100',
      paperWidthMm: 80,
    },
    scanner: {
      enabled: true,
      mode: 'keyboard_wedge',
      baudRate: 9600,
      terminator: '\r',
      cameraFrameRate: 30,
      cameraResolution: '1280x720',
    },
    scale: {
      enabled: false,
      model: 'Generic serial',
      comPort: 'COM1',
      baudRate: 9600,
      prefix: '',
      suffix: 'kg',
      unit: 'kg',
    },
  };
}
