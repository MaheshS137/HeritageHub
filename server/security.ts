import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import { getDb } from './db.ts';

export type AccountRole = 'USER' | 'JOURNALIST' | 'ADMIN';
export type LanguageCode = 'en' | 'kn' | 'hi';

export interface SafeAccount {
  id: string;
  fullName: string;
  email: string;
  role: AccountRole;
  bioIntro: string;
  preferredLanguage: LanguageCode;
  active: boolean;
  createdAt: string;
}

export interface AccountRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: AccountRole;
  bio_intro: string;
  preferred_language: LanguageCode;
  active: number;
  session_version: number;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: SafeAccount;
  sessionVersion?: number;
}

export const SESSION_COOKIE_NAME = 'hh_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const BCRYPT_ROUNDS = 10;

let cachedSecret: string | null = null;

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (cachedSecret) return cachedSecret;
  const secretPath = path.resolve(process.cwd(), 'data/.session_secret');
  fs.mkdirSync(path.dirname(secretPath), { recursive: true });
  if (fs.existsSync(secretPath)) {
    cachedSecret = fs.readFileSync(secretPath, 'utf8').trim();
    if (cachedSecret.length >= 32) return cachedSecret;
  }
  cachedSecret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretPath, cachedSecret, { mode: 0o600 });
  return cachedSecret;
}

export function hashSecret(raw: string): string {
  return bcrypt.hashSync(raw, BCRYPT_ROUNDS);
}

export function verifySecret(raw: string, hash: string): boolean {
  return bcrypt.compareSync(raw, hash);
}

export function normalizeSecurityAnswer(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must include at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must include at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, reason: 'Password must include at least one special character.' };
  }
  return { valid: true };
}

export function toSafeAccount(row: AccountRow): SafeAccount {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    bioIntro: row.bio_intro || '',
    preferredLanguage: row.preferred_language || 'en',
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

interface SessionPayload {
  uid: string;
  role: AccountRole;
  sv: number;
  exp: number;
}

export function signSessionToken(account: { id: string; role: AccountRole; session_version: number }): string {
  const payload: SessionPayload = {
    uid: account.id,
    role: account.role,
    sv: account.session_version,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isHttpsRequest(res: Response): boolean {
  const req = res.req;
  if (!req) return process.env.NODE_ENV === 'production';
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return Boolean(req.secure || forwardedProto === 'https' || process.env.NODE_ENV === 'production');
}

export function setSessionCookie(res: Response, account: { id: string; role: AccountRole; session_version: number }): void {
  const token = signSessionToken(account);
  const secure = isHttpsRequest(res);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  const secure = isHttpsRequest(res);
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  });
}

export function attachUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    next();
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    clearSessionCookie(res);
    next();
    return;
  }
  const db = getDb();
  const row = db.prepare('SELECT * FROM accounts WHERE id = ?').get(payload.uid) as AccountRow | undefined;
  if (!row || row.active !== 1 || row.session_version !== payload.sv) {
    clearSessionCookie(res);
    next();
    return;
  }
  req.user = toSafeAccount(row);
  req.sessionVersion = row.session_version;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

export function requireRole(...roles: AccountRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to access this resource.' });
      return;
    }
    next();
  };
}

export function checkRateLimit(bucketKey: string, maxAttempts: number, windowMs: number, lockoutMs: number): { allowed: boolean; retryAfterSec?: number } {
  const db = getDb();
  const now = Date.now();
  const existing = db.prepare('SELECT * FROM rate_limits WHERE bucket_key = ?').get(bucketKey) as
    | { bucket_key: string; attempts: number; window_expires_at: number; locked_until: number | null }
    | undefined;

  if (existing?.locked_until && existing.locked_until > now) {
    return { allowed: false, retryAfterSec: Math.ceil((existing.locked_until - now) / 1000) };
  }

  if (!existing || existing.window_expires_at < now) {
    db.prepare(`
      INSERT INTO rate_limits (bucket_key, attempts, window_expires_at, locked_until)
      VALUES (?, 1, ?, NULL)
      ON CONFLICT(bucket_key) DO UPDATE SET attempts = 1, window_expires_at = excluded.window_expires_at, locked_until = NULL
    `).run(bucketKey, now + windowMs);
    return { allowed: true };
  }

  const nextAttempts = existing.attempts + 1;
  if (nextAttempts > maxAttempts) {
    const lockedUntil = now + lockoutMs;
    db.prepare('UPDATE rate_limits SET attempts = ?, locked_until = ? WHERE bucket_key = ?').run(
      nextAttempts,
      lockedUntil,
      bucketKey,
    );
    return { allowed: false, retryAfterSec: Math.ceil(lockoutMs / 1000) };
  }

  db.prepare('UPDATE rate_limits SET attempts = ? WHERE bucket_key = ?').run(nextAttempts, bucketKey);
  return { allowed: true };
}

export function clearRateLimit(bucketKey: string): void {
  const db = getDb();
  db.prepare('DELETE FROM rate_limits WHERE bucket_key = ?').run(bucketKey);
}
