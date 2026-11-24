import express from 'express';
import { getDb } from '../db.ts';
import {
  type AccountRow,
  type AuthenticatedRequest,
  type LanguageCode,
  hashSecret,
  requireAuth,
  setSessionCookie,
  toSafeAccount,
  validatePasswordStrength,
  verifySecret,
} from '../security.ts';

export const userRouter = express.Router();

userRouter.use(requireAuth);

userRouter.get('/dashboard', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const uid = req.user!.id;

  const favoriteMonuments = db
    .prepare('SELECT monument_id, monument_name, district_id, district_name, image_url, created_at FROM user_favorite_monuments WHERE account_id = ? ORDER BY created_at DESC')
    .all(uid);

  const favoriteDistricts = db
    .prepare('SELECT district_id, district_name, region, image_url, created_at FROM user_favorite_districts WHERE account_id = ? ORDER BY created_at DESC')
    .all(uid);

  const recentViews = db
    .prepare('SELECT id, item_type, item_id, item_title, district_id, image_url, route_path, viewed_at FROM user_recent_views WHERE account_id = ? ORDER BY viewed_at DESC LIMIT 12')
    .all(uid);

  res.json({
    user: req.user,
    favoriteMonuments,
    favoriteDistricts,
    recentViews,
  });
});

userRouter.patch('/profile', (req: AuthenticatedRequest, res) => {
  const fullName = String(req.body?.fullName || '').trim();
  const bioIntro = String(req.body?.bioIntro || '').trim();
  const langRaw = String(req.body?.preferredLanguage || req.user!.preferredLanguage).trim().toLowerCase();
  const preferredLanguage: LanguageCode = langRaw === 'kn' || langRaw === 'hi' ? langRaw : 'en';

  if (fullName.length < 2) {
    res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    return;
  }

  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE accounts SET full_name = ?, bio_intro = ?, preferred_language = ?, updated_at = ? WHERE id = ?').run(
    fullName,
    bioIntro,
    preferredLanguage,
    now,
    req.user!.id,
  );

  const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.user!.id) as unknown as AccountRow;
  res.json({ message: 'Profile updated successfully.', user: toSafeAccount(updated) });
});

userRouter.patch('/language', (req: AuthenticatedRequest, res) => {
  const langRaw = String(req.body?.language || '').trim().toLowerCase();
  if (!['en', 'kn', 'hi'].includes(langRaw)) {
    res.status(400).json({ error: 'Unsupported language code. Use en, kn, or hi.' });
    return;
  }
  const db = getDb();
  db.prepare('UPDATE accounts SET preferred_language = ?, updated_at = ? WHERE id = ?').run(
    langRaw,
    new Date().toISOString(),
    req.user!.id,
  );
  res.json({ ok: true, preferredLanguage: langRaw });
});

userRouter.post('/change-password', (req: AuthenticatedRequest, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  const confirmPassword = String(req.body?.confirmPassword || '');

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Please fill in all password fields.' });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New password and confirm password do not match.' });
    return;
  }
  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    res.status(400).json({ error: strength.reason || 'Password does not meet security requirements.' });
    return;
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.user!.id) as unknown as AccountRow;
  if (!verifySecret(currentPassword, row.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  const newHash = hashSecret(newPassword);
  const now = new Date().toISOString();
  db.prepare('UPDATE accounts SET password_hash = ?, session_version = session_version + 1, updated_at = ? WHERE id = ?').run(
    newHash,
    now,
    row.id,
  );

  const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(row.id) as unknown as AccountRow;
  setSessionCookie(res, updated);
  res.json({ ok: true, message: 'Password updated and previous sessions invalidated.' });
});

userRouter.post('/favorites/monuments', (req: AuthenticatedRequest, res) => {
  const monumentId = String(req.body?.monumentId || '').trim();
  const monumentName = String(req.body?.monumentName || '').trim();
  const districtId = String(req.body?.districtId || '').trim();
  const districtName = String(req.body?.districtName || '').trim();
  const imageUrl = String(req.body?.imageUrl || '/images/hero-hampi.jpg').trim();

  if (!monumentId || !monumentName || !districtId) {
    res.status(400).json({ error: 'Missing monument details.' });
    return;
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO user_favorite_monuments (account_id, monument_id, monument_name, district_id, district_name, image_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(account_id, monument_id) DO NOTHING
  `).run(req.user!.id, monumentId, monumentName, districtId, districtName, imageUrl, new Date().toISOString());

  res.status(201).json({ ok: true });
});

userRouter.delete('/favorites/monuments/:monumentId', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  db.prepare('DELETE FROM user_favorite_monuments WHERE account_id = ? AND monument_id = ?').run(
    req.user!.id,
    req.params.monumentId,
  );
  res.json({ ok: true });
});

userRouter.post('/favorites/districts', (req: AuthenticatedRequest, res) => {
  const districtId = String(req.body?.districtId || '').trim();
  const districtName = String(req.body?.districtName || '').trim();
  const region = String(req.body?.region || '').trim();
  const imageUrl = String(req.body?.imageUrl || '/images/hero-hampi.jpg').trim();

  if (!districtId || !districtName) {
    res.status(400).json({ error: 'Missing district details.' });
    return;
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO user_favorite_districts (account_id, district_id, district_name, region, image_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(account_id, district_id) DO NOTHING
  `).run(req.user!.id, districtId, districtName, region, imageUrl, new Date().toISOString());

  res.status(201).json({ ok: true });
});

userRouter.delete('/favorites/districts/:districtId', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  db.prepare('DELETE FROM user_favorite_districts WHERE account_id = ? AND district_id = ?').run(
    req.user!.id,
    req.params.districtId,
  );
  res.json({ ok: true });
});

userRouter.post('/recent-views', (req: AuthenticatedRequest, res) => {
  const itemType = String(req.body?.itemType || 'district');
  const itemId = String(req.body?.itemId || '').trim();
  const itemTitle = String(req.body?.itemTitle || '').trim();
  const districtId = String(req.body?.districtId || '').trim();
  const imageUrl = String(req.body?.imageUrl || '').trim();
  const routePath = String(req.body?.routePath || '/').trim();

  if (!itemId || !itemTitle || !['monument', 'district', 'culture', 'article'].includes(itemType)) {
    res.status(400).json({ error: 'Invalid recent view payload.' });
    return;
  }

  const db = getDb();
  db.prepare('DELETE FROM user_recent_views WHERE account_id = ? AND item_type = ? AND item_id = ?').run(
    req.user!.id,
    itemType,
    itemId,
  );
  db.prepare(`
    INSERT INTO user_recent_views (account_id, item_type, item_id, item_title, district_id, image_url, route_path, viewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user!.id, itemType, itemId, itemTitle, districtId, imageUrl, routePath, new Date().toISOString());

  db.prepare(`
    DELETE FROM user_recent_views
    WHERE account_id = ?
      AND id NOT IN (
        SELECT id FROM user_recent_views WHERE account_id = ? ORDER BY viewed_at DESC LIMIT 12
      )
  `).run(req.user!.id, req.user!.id);

  res.status(201).json({ ok: true });
});
