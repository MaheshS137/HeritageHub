import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { getDb } from '../db.ts';
import { type AuthenticatedRequest, requireRole } from '../security.ts';

const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `article-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|jpg)$/i.test(file.mimetype);
    cb(null, ok);
  },
});

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base || 'article'}-${crypto.randomBytes(3).toString('hex')}`;
}

export const journalistRouter = express.Router();

journalistRouter.use(requireRole('JOURNALIST'));

journalistRouter.get('/articles', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM articles WHERE author_id = ? ORDER BY updated_at DESC')
    .all(req.user!.id);
  res.json({ articles: rows });
});

journalistRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please select a valid JPG, PNG, or WEBP image (max 5 MB).' });
    return;
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

journalistRouter.post('/articles', (req: AuthenticatedRequest, res) => {
  const body = req.body || {};
  const requestedStatus = String(body.status || 'DRAFT').toUpperCase();

  if (['APPROVED', 'PUBLISHED', 'REJECTED'].includes(requestedStatus)) {
    res.status(403).json({
      error: 'Journalists cannot approve, reject, or publish articles. Submit your article for admin review instead.',
    });
    return;
  }

  const title = String(body.title || '').trim();
  const shortDescription = String(body.shortDescription || '').trim();
  const content = String(body.content || '').trim();
  const districtId = String(body.districtId || '').trim();
  const categorySlug = String(body.categorySlug || '').trim();
  const coverImageUrl = String(body.coverImageUrl || '/images/hero-hampi.jpg').trim();

  if (title.length < 5 || shortDescription.length < 15 || content.length < 40) {
    res.status(400).json({
      error: 'Please provide an article title (5+ chars), short summary (15+ chars), and full article content (40+ chars).',
    });
    return;
  }
  if (!districtId || !categorySlug) {
    res.status(400).json({ error: 'Please select both a Karnataka district and a cultural category.' });
    return;
  }

  const db = getDb();
  const district = db.prepare('SELECT id, name FROM districts WHERE id = ?').get(districtId) as
    | { id: string; name: string }
    | undefined;
  const category = db.prepare('SELECT slug FROM categories WHERE slug = ?').get(categorySlug);

  if (!district || !category) {
    res.status(400).json({ error: 'Invalid district or cultural category selected.' });
    return;
  }

  const status = requestedStatus === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'DRAFT';
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug = slugify(title);
  const submittedAt = status === 'PENDING_REVIEW' ? now : null;

  db.prepare(`
    INSERT INTO articles (
      id, title, slug, short_description, content, district_id, district_name,
      category_slug, cover_image_url, author_id, author_name, status, admin_feedback,
      submitted_at, reviewed_at, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, NULL, NULL, ?, ?)
  `).run(
    id,
    title,
    slug,
    shortDescription,
    content,
    district.id,
    district.name,
    categorySlug,
    coverImageUrl,
    req.user!.id,
    req.user!.fullName,
    status,
    submittedAt,
    now,
    now,
  );

  const created = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.status(201).json({ article: created });
});

journalistRouter.put('/articles/:id', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  if (existing.author_id !== req.user!.id) {
    res.status(403).json({ error: 'You can only edit your own articles.' });
    return;
  }
  if (!['DRAFT', 'REJECTED'].includes(String(existing.status))) {
    res.status(400).json({ error: 'Only Draft or Rejected articles can be edited.' });
    return;
  }

  const body = req.body || {};
  const requestedStatus = String(body.status || existing.status).toUpperCase();
  if (['APPROVED', 'PUBLISHED'].includes(requestedStatus)) {
    res.status(403).json({ error: 'Journalists cannot approve or publish their own articles.' });
    return;
  }

  const title = String(body.title ?? existing.title).trim();
  const shortDescription = String(body.shortDescription ?? existing.short_description).trim();
  const content = String(body.content ?? existing.content).trim();
  const districtId = String(body.districtId ?? existing.district_id).trim();
  const categorySlug = String(body.categorySlug ?? existing.category_slug).trim();
  const coverImageUrl = String(body.coverImageUrl ?? existing.cover_image_url).trim();

  if (title.length < 5 || shortDescription.length < 15 || content.length < 40) {
    res.status(400).json({ error: 'Title, short description, and full content must meet minimum lengths.' });
    return;
  }

  const district = db.prepare('SELECT id, name FROM districts WHERE id = ?').get(districtId) as
    | { id: string; name: string }
    | undefined;
  if (!district) {
    res.status(400).json({ error: 'Selected district does not exist.' });
    return;
  }

  const nextStatus = requestedStatus === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'DRAFT';
  const now = new Date().toISOString();
  const submittedAt = nextStatus === 'PENDING_REVIEW' ? now : (existing.submitted_at as string | null);

  db.prepare(`
    UPDATE articles
    SET title = ?, short_description = ?, content = ?, district_id = ?, district_name = ?,
        category_slug = ?, cover_image_url = ?, status = ?, submitted_at = ?, updated_at = ?
    WHERE id = ? AND author_id = ?
  `).run(
    title,
    shortDescription,
    content,
    district.id,
    district.name,
    categorySlug,
    coverImageUrl,
    nextStatus,
    submittedAt,
    now,
    req.params.id,
    req.user!.id,
  );

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json({ article: updated });
});

journalistRouter.post('/articles/:id/submit', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  if (existing.author_id !== req.user!.id) {
    res.status(403).json({ error: 'You can only submit your own articles.' });
    return;
  }
  if (!['DRAFT', 'REJECTED'].includes(String(existing.status))) {
    res.status(400).json({ error: 'Only Draft or Rejected articles can be submitted for review.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE articles SET status = 'PENDING_REVIEW', submitted_at = ?, updated_at = ?
    WHERE id = ? AND author_id = ?
  `).run(now, now, req.params.id, req.user!.id);

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json({ article: updated, message: 'Article submitted for administrator review.' });
});
