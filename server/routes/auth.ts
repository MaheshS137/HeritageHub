import crypto from 'node:crypto';
import express from 'express';
import { getDb } from '../db.ts';
import {
  type AccountRole,
  type AccountRow,
  type AuthenticatedRequest,
  type LanguageCode,
  checkRateLimit,
  clearRateLimit,
  clearSessionCookie,
  hashSecret,
  isValidEmail,
  normalizeEmail,
  normalizeSecurityAnswer,
  setSessionCookie,
  toSafeAccount,
  validatePasswordStrength,
  verifySecret,
} from '../security.ts';

export const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What is the name of your hometown?',
  'What was your childhood nickname?',
  'What is the name of your favorite Karnataka monument or town?',
  'What was the first book you remember reading?',
];

export const authRouter = express.Router();

function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
}

function deterministicFallbackQuestion(email: string): string {
  const digest = crypto.createHash('sha256').update(email).digest();
  return SECURITY_QUESTIONS[digest[0] % SECURITY_QUESTIONS.length];
}

authRouter.get('/security-questions', (_req, res) => {
  res.json({ questions: SECURITY_QUESTIONS });
});

authRouter.get('/setup-status', (_req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) AS count FROM accounts WHERE role = 'ADMIN'").get() as { count: number };
  res.json({ needsInitialAdmin: row.count === 0 });
});

authRouter.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.json({ authenticated: false, user: null });
    return;
  }
  res.json({ authenticated: true, user: req.user });
});

function handleCreateAccount(
  body: Record<string, unknown>,
  enforcedRole: AccountRole,
  requireBio: boolean,
): { ok: true; accountRow: AccountRow } | { ok: false; status: number; error: string } {
  const fullName = String(body.fullName || '').trim();
  const email = normalizeEmail(String(body.email || ''));
  const password = String(body.password || '');
  const confirmPassword = String(body.confirmPassword || '');
  const securityQuestion = String(body.securityQuestion || '').trim();
  const securityAnswer = String(body.securityAnswer || '');
  const bioIntro = String(body.bioIntro || '').trim();
  const langRaw = String(body.preferredLanguage || 'en').trim().toLowerCase();
  const preferredLanguage: LanguageCode = langRaw === 'kn' || langRaw === 'hi' ? langRaw : 'en';

  if (body.role && String(body.role).toUpperCase() !== enforcedRole) {
    return { ok: false, status: 403, error: 'Role modification is not permitted.' };
  }

  if (fullName.length < 2) {
    return { ok: false, status: 400, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, error: 'Please provide a valid email address.' };
  }
  if (password !== confirmPassword) {
    return { ok: false, status: 400, error: 'Password and confirm password do not match.' };
  }
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return { ok: false, status: 400, error: strength.reason || 'Password does not meet security criteria.' };
  }
  if (requireBio && bioIntro.length < 15) {
    return {
      ok: false,
      status: 400,
      error: 'Please provide a short professional introduction (at least 15 characters).',
    };
  }
  if (securityQuestion.length < 5) {
    return { ok: false, status: 400, error: 'Please select or enter a valid security question.' };
  }
  const normalizedAns = normalizeSecurityAnswer(securityAnswer);
  if (normalizedAns.length < 2) {
    return { ok: false, status: 400, error: 'Please provide a valid security answer (at least 2 characters).' };
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM accounts WHERE email = ?').get(email);
  if (existing) {
    return { ok: false, status: 409, error: 'An account with this email address already exists.' };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const passwordHash = hashSecret(password);
  const answerHash = hashSecret(normalizedAns);

  db.prepare(`
    INSERT INTO accounts (id, full_name, email, password_hash, role, bio_intro, preferred_language, active, session_version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
  `).run(id, fullName, email, passwordHash, enforcedRole, bioIntro, preferredLanguage, now, now);

  db.prepare(`
    INSERT INTO security_credentials (account_id, question, answer_hash, failed_attempts, locked_until)
    VALUES (?, ?, ?, 0, NULL)
  `).run(id, securityQuestion, answerHash);

  const created = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as unknown as AccountRow;
  return { ok: true, accountRow: created };
}

authRouter.post('/setup-admin', (req, res) => {
  const db = getDb();
  const adminCount = (db.prepare("SELECT COUNT(*) AS count FROM accounts WHERE role = 'ADMIN'").get() as { count: number })
    .count;
  if (adminCount > 0) {
    res.status(403).json({
      error: 'Initial admin setup is locked because an administrator already exists. Subsequent admins must be created by an authenticated admin.',
    });
    return;
  }

  const result = handleCreateAccount(req.body || {}, 'ADMIN', false);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  setSessionCookie(res, result.accountRow);
  res.status(201).json({
    message: 'Initial administrator account created successfully.',
    user: toSafeAccount(result.accountRow),
  });
});

authRouter.post('/register/user', (req, res) => {
  const result = handleCreateAccount(req.body || {}, 'USER', false);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  setSessionCookie(res, result.accountRow);
  res.status(201).json({
    message: 'User account registered successfully.',
    user: toSafeAccount(result.accountRow),
  });
});

authRouter.post('/register/journalist', (req, res) => {
  const result = handleCreateAccount(req.body || {}, 'JOURNALIST', true);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  setSessionCookie(res, result.accountRow);
  res.status(201).json({
    message: 'Journalist account registered successfully.',
    user: toSafeAccount(result.accountRow),
  });
});

authRouter.post('/login', (req, res) => {
  const body = req.body || {};
  const email = normalizeEmail(String(body.email || ''));
  const password = String(body.password || '');
  const expectedRole = body.expectedRole ? String(body.expectedRole).toUpperCase() : null;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`login:${ip}:${email}`, 8, 10 * 60 * 1000, 10 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      error: `Too many login attempts. Please wait ${Math.ceil((rate.retryAfterSec || 60) / 60)} minute(s) before trying again.`,
    });
    return;
  }

  if (!isValidEmail(email) || !password) {
    res.status(400).json({ error: 'Please enter both a valid email address and password.' });
    return;
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM accounts WHERE email = ?').get(email) as AccountRow | undefined;

  if (!row || !verifySecret(password, row.password_hash)) {
    res.status(401).json({ error: 'Invalid email address or password.' });
    return;
  }

  if (row.active !== 1) {
    res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
    return;
  }

  if (expectedRole && ['USER', 'JOURNALIST', 'ADMIN'].includes(expectedRole) && row.role !== expectedRole) {
    res.status(403).json({
      error: `This login form is for ${expectedRole.toLowerCase()} accounts. Please select the ${row.role.toLowerCase()} login card.`,
    });
    return;
  }

  clearRateLimit(`login:${ip}:${email}`);
  setSessionCookie(res, row);
  res.json({
    message: 'Signed in successfully.',
    user: toSafeAccount(row),
  });
});

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// STEP 2 -> 3: Request Security Question without leaking email existence
authRouter.post('/recovery/question', (req, res) => {
  const email = normalizeEmail(String(req.body?.email || ''));
  const ip = getClientIp(req);
  const rate = checkRateLimit(`rec-q:${ip}`, 15, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rate.allowed) {
    res.status(429).json({
      error: `Too many recovery requests. Please wait ${Math.ceil((rate.retryAfterSec || 60) / 60)} minute(s).`,
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const db = getDb();
  const cred = db
    .prepare(
      `SELECT sc.question, a.active
       FROM accounts a
       JOIN security_credentials sc ON sc.account_id = a.id
       WHERE a.email = ?`,
    )
    .get(email) as { question: string; active: number } | undefined;

  // Never disclose via error message whether the email address exists
  const question = cred && cred.active === 1 ? cred.question : deterministicFallbackQuestion(email);
  res.json({
    ok: true,
    question,
    notice: 'If an active account is associated with this email, answer the security question below to proceed.',
  });
});

// STEP 4 -> 5: Verify Security Answer with rate limiting & lockout
authRouter.post('/recovery/verify', (req, res) => {
  const email = normalizeEmail(String(req.body?.email || ''));
  const answer = normalizeSecurityAnswer(String(req.body?.answer || ''));
  const ip = getClientIp(req);

  const ipRate = checkRateLimit(`rec-v-ip:${ip}`, 12, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!ipRate.allowed) {
    res.status(429).json({
      error: `Too many incorrect verification attempts. Locked for ${Math.ceil((ipRate.retryAfterSec || 60) / 60)} minute(s).`,
    });
    return;
  }

  const bucketRate = checkRateLimit(`rec-v:${email}`, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!bucketRate.allowed) {
    res.status(429).json({
      error: `Verification temporarily locked due to repeated incorrect answers. Try again in ${Math.ceil((bucketRate.retryAfterSec || 60) / 60)} minute(s).`,
    });
    return;
  }

  if (!isValidEmail(email) || answer.length < 2) {
    res.status(400).json({ error: 'Please enter your email address and security answer.' });
    return;
  }

  const db = getDb();
  const record = db
    .prepare(
      `SELECT a.id AS account_id, a.active, sc.answer_hash, sc.failed_attempts, sc.locked_until
       FROM accounts a
       JOIN security_credentials sc ON sc.account_id = a.id
       WHERE a.email = ?`,
    )
    .get(email) as
    | { account_id: string; active: number; answer_hash: string; failed_attempts: number; locked_until: number | null }
    | undefined;

  const now = Date.now();
  if (record?.locked_until && record.locked_until > now) {
    const mins = Math.ceil((record.locked_until - now) / 60000);
    res.status(429).json({
      error: `Verification temporarily locked due to repeated incorrect answers. Try again in ${mins} minute(s).`,
    });
    return;
  }

  if (!record || record.active !== 1 || !verifySecret(answer, record.answer_hash)) {
    if (record) {
      const nextFails = record.failed_attempts + 1;
      const lockedUntil = nextFails >= 5 ? now + 15 * 60 * 1000 : null;
      db.prepare('UPDATE security_credentials SET failed_attempts = ?, locked_until = ? WHERE account_id = ?').run(
        nextFails,
        lockedUntil,
        record.account_id,
      );
    }
    res.status(401).json({ error: 'Verification failed. Please check your security answer and try again.' });
    return;
  }

  db.prepare('UPDATE security_credentials SET failed_attempts = 0, locked_until = NULL WHERE account_id = ?').run(
    record.account_id,
  );
  clearRateLimit(`rec-v:${email}`);
  clearRateLimit(`rec-v-ip:${ip}`);

  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
  const expiresAt = now + 15 * 60 * 1000;

  db.prepare('INSERT INTO password_reset_tokens (token_hash, account_id, expires_at, used) VALUES (?, ?, ?, 0)').run(
    tokenHash,
    record.account_id,
    expiresAt,
  );

  res.json({
    ok: true,
    resetToken: rawResetToken,
    message: 'Security answer verified. You may now set a new password.',
  });
});

// STEP 6 -> 7: Reset password and invalidate all existing sessions
authRouter.post('/recovery/reset', (req, res) => {
  const resetToken = String(req.body?.resetToken || '');
  const newPassword = String(req.body?.newPassword || '');
  const confirmPassword = String(req.body?.confirmPassword || '');

  if (!resetToken) {
    res.status(400).json({ error: 'Password reset session has expired. Please start recovery again.' });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New password and confirm password do not match.' });
    return;
  }
  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    res.status(400).json({ error: strength.reason || 'Password does not meet security strength criteria.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM password_reset_tokens WHERE token_hash = ?')
    .get(tokenHash) as { token_hash: string; account_id: string; expires_at: number; used: number } | undefined;

  if (!row || row.used === 1 || row.expires_at < Date.now()) {
    res.status(400).json({ error: 'This password reset token is invalid or has expired.' });
    return;
  }

  const newHash = hashSecret(newPassword);
  const nowIso = new Date().toISOString();

  db.prepare('UPDATE accounts SET password_hash = ?, session_version = session_version + 1, updated_at = ? WHERE id = ?').run(
    newHash,
    nowIso,
    row.account_id,
  );
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE account_id = ?').run(row.account_id);

  clearSessionCookie(res);
  res.json({
    ok: true,
    message: 'Password reset successfully. All previous sessions have been invalidated. Please sign in with your new password.',
  });
});
