import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { getDb } from '../db.ts';
import {
  type AccountRow,
  type AuthenticatedRequest,
  hashSecret,
  isValidEmail,
  normalizeEmail,
  normalizeSecurityAnswer,
  requireRole,
  toSafeAccount,
  validatePasswordStrength,
} from '../security.ts';

const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `monument-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|jpg)$/i.test(file.mimetype)),
});

export const adminRouter = express.Router();

adminRouter.use(requireRole('ADMIN'));

// Dashboard Statistics
adminRouter.get('/stats', (_req, res) => {
  const db = getDb();
  const totalUsers = (db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE role = 'USER'").get() as { c: number }).c;
  const totalJournalists = (db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE role = 'JOURNALIST'").get() as { c: number }).c;
  const totalDistricts = (db.prepare('SELECT COUNT(*) AS c FROM districts').get() as { c: number }).c;
  const totalMonuments = (db.prepare('SELECT COUNT(*) AS c FROM monuments').get() as { c: number }).c;
  const pendingArticles = (db.prepare("SELECT COUNT(*) AS c FROM articles WHERE status = 'PENDING_REVIEW'").get() as { c: number }).c;
  const publishedArticles = (db.prepare("SELECT COUNT(*) AS c FROM articles WHERE status = 'PUBLISHED'").get() as { c: number }).c;

  res.json({
    totalUsers,
    totalJournalists,
    totalDistricts,
    totalMonuments,
    pendingArticles,
    publishedArticles,
  });
});

// User & Journalist Management
adminRouter.get('/users', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const role = String(req.query.role || 'ALL').toUpperCase();
  const db = getDb();

  let rows = db.prepare('SELECT * FROM accounts ORDER BY created_at DESC').all() as unknown as AccountRow[];
  if (role !== 'ALL' && ['USER', 'JOURNALIST', 'ADMIN'].includes(role)) {
    rows = rows.filter((r) => r.role === role);
  }
  if (q) {
    rows = rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.bio_intro || '').toLowerCase().includes(q),
    );
  }

  res.json({ users: rows.map(toSafeAccount) });
});

adminRouter.get('/users/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as AccountRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }
  const articleCount = (db.prepare('SELECT COUNT(*) AS c FROM articles WHERE author_id = ?').get(row.id) as { c: number }).c;
  const favoriteCount = (
    db.prepare('SELECT COUNT(*) AS c FROM user_favorite_monuments WHERE account_id = ?').get(row.id) as { c: number }
  ).c;

  res.json({
    user: toSafeAccount(row),
    metrics: { articleCount, favoriteCount },
  });
});

adminRouter.patch('/users/:id/status', (req: AuthenticatedRequest, res) => {
  const active = Boolean(req.body?.active);
  if (req.params.id === req.user!.id && !active) {
    res.status(400).json({ error: 'You cannot deactivate your own active administrator account.' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as AccountRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }

  db.prepare('UPDATE accounts SET active = ?, session_version = session_version + 1, updated_at = ? WHERE id = ?').run(
    active ? 1 : 0,
    new Date().toISOString(),
    req.params.id,
  );

  const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as unknown as AccountRow;
  res.json({ user: toSafeAccount(updated), message: active ? 'Account activated.' : 'Account deactivated.' });
});

// Controlled subsequent Admin creation by authenticated Admin
adminRouter.post('/admins', (req, res) => {
  const body = req.body || {};
  const fullName = String(body.fullName || '').trim();
  const email = normalizeEmail(String(body.email || ''));
  const password = String(body.password || '');
  const confirmPassword = String(body.confirmPassword || '');
  const securityQuestion = String(body.securityQuestion || '').trim();
  const securityAnswer = normalizeSecurityAnswer(String(body.securityAnswer || ''));

  if (fullName.length < 2 || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid full name and email address are required.' });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Password and confirm password do not match.' });
    return;
  }
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    res.status(400).json({ error: strength.reason });
    return;
  }
  if (securityQuestion.length < 5 || securityAnswer.length < 2) {
    res.status(400).json({ error: 'Security question and answer are required.' });
    return;
  }

  const db = getDb();
  if (db.prepare('SELECT id FROM accounts WHERE email = ?').get(email)) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO accounts (id, full_name, email, password_hash, role, bio_intro, preferred_language, active, session_version, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'ADMIN', 'HeritageHub Platform Administrator', 'en', 1, 1, ?, ?)
  `).run(id, fullName, email, hashSecret(password), now, now);

  db.prepare(`
    INSERT INTO security_credentials (account_id, question, answer_hash, failed_attempts, locked_until)
    VALUES (?, ?, ?, 0, NULL)
  `).run(id, securityQuestion, hashSecret(securityAnswer));

  const created = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as unknown as AccountRow;
  res.status(201).json({ user: toSafeAccount(created), message: 'New administrator account created.' });
});

// Journalist Article Review & Publishing
adminRouter.get('/articles', (req, res) => {
  const status = String(req.query.status || 'ALL').toUpperCase();
  const db = getDb();
  let rows = db.prepare('SELECT * FROM articles ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
  if (status !== 'ALL') {
    rows = rows.filter((r) => r.status === status);
  }
  res.json({ articles: rows });
});

adminRouter.post('/articles/:id/approve', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  const now = new Date().toISOString();
  const feedback = String(req.body?.feedback || '').trim();
  db.prepare(`
    UPDATE articles SET status = 'APPROVED', admin_feedback = ?, reviewed_at = ?, updated_at = ?
    WHERE id = ?
  `).run(feedback, now, now, req.params.id);
  res.json({ article: db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) });
});

adminRouter.post('/articles/:id/reject', (req, res) => {
  const feedback = String(req.body?.feedback || '').trim();
  if (feedback.length < 5) {
    res.status(400).json({ error: 'Please provide clear editorial feedback when rejecting an article.' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE articles SET status = 'REJECTED', admin_feedback = ?, reviewed_at = ?, updated_at = ?
    WHERE id = ?
  `).run(feedback, now, now, req.params.id);
  res.json({ article: db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) });
});

adminRouter.post('/articles/:id/publish', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE articles SET status = 'PUBLISHED', reviewed_at = COALESCE(reviewed_at, ?), published_at = ?, updated_at = ?
    WHERE id = ?
  `).run(now, now, now, req.params.id);
  res.json({ article: db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) });
});

// Upload monument photograph
adminRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please choose a valid JPG, PNG, or WEBP photograph (max 5 MB).' });
    return;
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// Monuments CRUD
adminRouter.get('/monuments', (_req, res) => {
  const db = getDb();
  res.json({ monuments: db.prepare('SELECT * FROM monuments ORDER BY district_name ASC, name ASC').all() });
});

adminRouter.post('/monuments', (req, res) => {
  const b = req.body || {};
  const districtId = String(b.districtId || '').trim();
  const name = String(b.name || '').trim();
  const location = String(b.location || '').trim();
  const lat = Number(b.lat || 14.5);
  const lng = Number(b.lng || 75.8);
  const imageUrl = String(b.imageUrl || '/images/hero-hampi.jpg').trim();
  const description = String(b.description || '').trim();
  const culturalSignificance = String(b.culturalSignificance || '').trim();
  const attribution = String(b.attribution || 'Admin Verified Entry').trim();

  if (!districtId || name.length < 3 || description.length < 10) {
    res.status(400).json({ error: 'District, monument name, and description are required.' });
    return;
  }

  const db = getDb();
  const dist = db.prepare('SELECT id, name FROM districts WHERE id = ?').get(districtId) as
    | { id: string; name: string }
    | undefined;
  if (!dist) {
    res.status(400).json({ error: 'Invalid district selected.' });
    return;
  }

  const id = `mon-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO monuments (id, district_id, district_name, name, location, lat, lng, image_url, description, cultural_significance, attribution, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', ?, ?)
  `).run(id, dist.id, dist.name, name, location || dist.name, lat, lng, imageUrl, description, culturalSignificance, attribution, now, now);

  res.status(201).json({ monument: db.prepare('SELECT * FROM monuments WHERE id = ?').get(id) });
});

adminRouter.put('/monuments/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM monuments WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Monument record not found.' });
    return;
  }
  const b = req.body || {};
  const name = String(b.name ?? existing.name).trim();
  const location = String(b.location ?? existing.location).trim();
  const lat = Number(b.lat ?? existing.lat);
  const lng = Number(b.lng ?? existing.lng);
  const imageUrl = String(b.imageUrl ?? existing.image_url).trim();
  const description = String(b.description ?? existing.description).trim();
  const culturalSignificance = String(b.culturalSignificance ?? existing.cultural_significance).trim();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE monuments
    SET name = ?, location = ?, lat = ?, lng = ?, image_url = ?, description = ?, cultural_significance = ?, updated_at = ?
    WHERE id = ?
  `).run(name, location, lat, lng, imageUrl, description, culturalSignificance, now, req.params.id);

  res.json({ monument: db.prepare('SELECT * FROM monuments WHERE id = ?').get(req.params.id) });
});

adminRouter.delete('/monuments/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM monuments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Monument not found.' });
    return;
  }
  res.json({ ok: true });
});

// District Management (description, flagship monument, festivals, traditions, history)
adminRouter.put('/districts/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM districts WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'District not found.' });
    return;
  }

  const b = req.body || {};
  const toArrJson = (val: unknown, fallback: unknown) => {
    if (Array.isArray(val)) return JSON.stringify(val.map((v) => String(v).trim()).filter(Boolean));
    if (typeof val === 'string') {
      return JSON.stringify(
        val
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
    return String(fallback || '[]');
  };

  db.prepare(`
    UPDATE districts
    SET monument_name = ?, monument_location = ?, monument_description = ?, cultural_significance = ?,
        description = ?, history = ?, documented = ?,
        festivals_json = ?, arts_json = ?, cuisine_json = ?, traditions_json = ?, heritage_sites_json = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    String(b.monumentName ?? existing.monument_name).trim(),
    String(b.monumentLocation ?? existing.monument_location).trim(),
    String(b.monumentDescription ?? existing.monument_description).trim(),
    String(b.culturalSignificance ?? existing.cultural_significance).trim(),
    String(b.description ?? existing.description).trim(),
    String(b.history ?? existing.history).trim(),
    b.documented !== undefined ? (b.documented ? 1 : 0) : Number(existing.documented),
    toArrJson(b.festivals, existing.festivals_json),
    toArrJson(b.arts, existing.arts_json),
    toArrJson(b.cuisine, existing.cuisine_json),
    toArrJson(b.traditions, existing.traditions_json),
    toArrJson(b.heritageSites, existing.heritage_sites_json),
    new Date().toISOString(),
    req.params.id,
  );

  res.json({ ok: true });
});

// Heritage Categories Management
adminRouter.post('/categories', (req, res) => {
  const b = req.body || {};
  const title = String(b.title || '').trim();
  const slug = String(b.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const subtitle = String(b.subtitle || '').trim();
  const description = String(b.description || '').trim();
  const imageKey = String(b.imageKey || 'hero-hampi').trim();

  if (!slug || title.length < 3 || description.length < 10) {
    res.status(400).json({ error: 'Category title and description are required.' });
    return;
  }

  const db = getDb();
  if (db.prepare('SELECT slug FROM categories WHERE slug = ?').get(slug)) {
    res.status(409).json({ error: 'A category with this slug already exists.' });
    return;
  }

  const count = (db.prepare('SELECT COUNT(*) AS c FROM categories').get() as { c: number }).c;
  const indexNumber = String(count + 1).padStart(2, '0');

  db.prepare(`
    INSERT INTO categories (slug, index_number, title, subtitle, description, image_key, alt_text, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, indexNumber, title, subtitle || title, description, imageKey, `${title} heritage category`, count + 1);

  res.status(201).json({ category: db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) });
});

adminRouter.put('/categories/:slug', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  const b = req.body || {};
  db.prepare('UPDATE categories SET title = ?, subtitle = ?, description = ? WHERE slug = ?').run(
    String(b.title ?? existing.title).trim(),
    String(b.subtitle ?? existing.subtitle).trim(),
    String(b.description ?? existing.description).trim(),
    req.params.slug,
  );
  res.json({ category: db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug) });
});

adminRouter.delete('/categories/:slug', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM categories WHERE slug = ?').run(req.params.slug);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json({ ok: true });
});

// Cultural Records & Festivals Management
adminRouter.post('/cultural-records', (req, res) => {
  const b = req.body || {};
  const title = String(b.title || '').trim();
  const categorySlug = String(b.categorySlug || 'festivals-celebrations').trim();
  const district = String(b.district || '').trim();
  const region = String(b.region || 'Old Mysore').trim();
  const recognitionOrEra = String(b.recognitionOrEra || 'Verified Regional Tradition').trim();
  const summary = String(b.summary || '').trim();
  const description = String(b.description || summary).trim();
  const imageKey = String(b.imageKey || 'mysore-palace').trim();
  const preservationNote = String(b.preservationNote || '').trim();

  if (title.length < 3 || !district || summary.length < 10) {
    res.status(400).json({ error: 'Title, district, and summary are required.' });
    return;
  }

  const db = getDb();
  const id = `rec-${crypto.randomBytes(4).toString('hex')}`;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${crypto.randomBytes(2).toString('hex')}`;
  const sourcesJson = JSON.stringify([
    {
      title: String(b.sourceTitle || 'HeritageHub Verified Cultural Registry'),
      organization: String(b.sourceOrganization || 'Department of Kannada and Culture / Archive'),
      referenceId: String(b.referenceId || 'Verified Entry'),
      url: String(b.sourceUrl || 'https://www.karnatakatourism.org/'),
    },
  ]);

  db.prepare(`
    INSERT INTO cultural_records (
      id, slug, title, category_slug, district, region, recognition_or_era,
      summary, description, verified_facts_json, preservation_note, image_key, alt_text, sources_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    title,
    categorySlug,
    district,
    region,
    recognitionOrEra,
    summary,
    description,
    JSON.stringify(Array.isArray(b.verifiedFacts) ? b.verifiedFacts : [summary]),
    preservationNote,
    imageKey,
    `${title} — ${district}, Karnataka`,
    sourcesJson,
    new Date().toISOString(),
  );

  res.status(201).json({ id, slug });
});

adminRouter.delete('/cultural-records/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM cultural_records WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Cultural record not found.' });
    return;
  }
  res.json({ ok: true });
});
