export const IPC = {
  GET_CONFIG: 'posapp:getConfig',
  SAVE_CONFIG: 'posapp:saveConfig',
  GET_HARDWARE: 'posapp:getHardwareSettings',
  SAVE_HARDWARE: 'posapp:saveHardwareSettings',
  GET_LAN: 'posapp:getLanAddresses',
  APPLY_FIREWALL: 'posapp:applyFirewallRule',
  SYNC_NOW: 'posapp:syncNow',
  ENQUEUE_TEST: 'posapp:enqueueTestOutbox',
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
