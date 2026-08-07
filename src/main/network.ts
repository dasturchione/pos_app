import { networkInterfaces } from 'node:os';

export function getLanIPv4Addresses(): string[] {
  const nets = networkInterfaces();
  const out: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        out.push(net.address);
      }
    }
  }
  return out;
}
