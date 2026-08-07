import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const RULE_NAME = 'PosApp_Server_TCP';

export async function addInboundRuleForPort(port: number): Promise<{ ok: boolean; message: string }> {
  if (process.platform !== 'win32') {
    return { ok: true, message: 'Firewall is only configured automatically on Windows.' };
  }

  const args = [
    'advfirewall',
    'firewall',
    'add',
    'rule',
    `name=${RULE_NAME}`,
    'dir=in',
    'action=allow',
    'protocol=TCP',
    `localport=${port}`,
  ];

  try {
    await execFileAsync('netsh', args, { windowsHide: true });
    return { ok: true, message: `Firewall rule added for TCP port ${port}.` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message:
        `Could not add firewall rule automatically (${msg}). ` +
        'Run the app as Administrator or add an inbound allow rule manually for this port.',
    };
  }
}
