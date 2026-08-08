import pino from 'pino';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}

export function createLogger(opts: { userDataPath: string }): Logger {
  const logsDir = join(opts.userDataPath, 'logs');
  
  // Ensure logs directory exists
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  const logFile = join(logsDir, 'app.log');
  const isDev = process.env['NODE_ENV'] !== 'production';

  const streams: pino.StreamEntry[] = [
    { stream: pino.destination({ dest: logFile, sync: true }) },
  ];

  if (isDev) {
    streams.push({ stream: process.stdout });
  }

  const logger = pino(
    {
      level: isDev ? 'debug' : 'info',
    },
    pino.multistream(streams)
  );

  return {
    info: (msg, meta) => logger.info(meta, msg),
    warn: (msg, meta) => logger.warn(meta, msg),
    error: (msg, meta) => logger.error(meta, msg),
    debug: (msg, meta) => logger.debug(meta, msg),
  };
}
