import type { AppConfig } from '@shared/appConfig';
import type { PosDatabase } from '../db/database';
import cors from 'cors';
import express, { type Express } from 'express';

export interface LocalServerContext {
  config: AppConfig;
  db: PosDatabase | null;
}

function authMiddleware(secret: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const header = req.header('X-PosApp-Auth');
    if (!secret || header !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  };
}

export function createLocalServer(ctx: LocalServerContext): Express {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mode: ctx.config.mode,
      shopName: ctx.config.shopName ?? '',
    });
  });

  const secret = ctx.config.syncAuthSecret;
  app.post('/api/sync/push', authMiddleware(secret), (req, res) => {
    const body = req.body as { items?: { id: number; payload: string }[] };
    const items = body.items ?? [];
    const acceptedIds = items.map((i) => i.id);
    res.json({ ok: true, acceptedIds });
  });

  app.get('/api/sync/pull', authMiddleware(secret), (_req, res) => {
    res.json({ ok: true, products: [] });
  });

  return app;
}

export function startLocalServer(
  app: Express,
  port: number,
  host = '0.0.0.0',
): ReturnType<Express['listen']> {
  return app.listen(port, host);
}
