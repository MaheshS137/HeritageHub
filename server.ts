import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db.ts';
import { attachUser } from './server/security.ts';
import { authRouter } from './server/routes/auth.ts';
import { userRouter } from './server/routes/user.ts';
import { journalistRouter } from './server/routes/journalist.ts';
import { adminRouter } from './server/routes/admin.ts';
import {
  mapCategoryRow,
  mapDistrictRow,
  mapRecordRow,
  publicRouter,
} from './server/routes/public.ts';

async function startServer() {
  // Initialize SQLite database & seed verified Karnataka datasets
  const db = getDb();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Enforce UTF-8 for API JSON responses
  app.use('/api', (_req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.use(attachUser);

  // Static uploaded media files
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/journalist', journalistRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/heritage', publicRouter);

  // Serve dynamic SQLite-backed archive JSON endpoints so Admin edits update maps & catalogs immediately
  app.get('/data/districts.json', (_req, res) => {
    const rows = db.prepare('SELECT * FROM districts ORDER BY name ASC').all() as Array<Record<string, unknown>>;
    res.json(rows.map(mapDistrictRow));
  });

  app.get('/data/cultural-categories.json', (_req, res) => {
    const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, title ASC').all() as Array<
      Record<string, unknown>
    >;
    res.json(rows.map(mapCategoryRow));
  });

  app.get('/data/cultural-records.json', (_req, res) => {
    const rows = db.prepare('SELECT * FROM cultural_records ORDER BY created_at ASC').all() as Array<
      Record<string, unknown>
    >;
    res.json(rows.map(mapRecordRow));
  });

  // Error handler for multer / JSON payloads
  app.use(
    (err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (res.headersSent) {
        next(err);
        return;
      }
      res.status(400).json({ error: err.message || 'Bad request.' });
    },
  );

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeritageHub server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start HeritageHub server:', err);
  process.exit(1);
});
