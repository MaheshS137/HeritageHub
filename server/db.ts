import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve(process.cwd(), process.env.HERITAGEHUB_DB_PATH || 'data/heritagehub.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(path.resolve(process.cwd(), 'public/uploads'), { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('USER', 'JOURNALIST', 'ADMIN')),
      bio_intro TEXT DEFAULT '',
      preferred_language TEXT NOT NULL DEFAULT 'en' CHECK(preferred_language IN ('en', 'kn', 'hi')),
      active INTEGER NOT NULL DEFAULT 1,
      session_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_credentials (
      account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer_hash TEXT NOT NULL,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      bucket_key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      window_expires_at INTEGER NOT NULL,
      locked_until INTEGER DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      division TEXT NOT NULL,
      documented INTEGER NOT NULL DEFAULT 0,
      geo_boundary_note TEXT DEFAULT '',
      monument_name TEXT NOT NULL DEFAULT '',
      monument_location TEXT NOT NULL DEFAULT '',
      monument_lat REAL NOT NULL,
      monument_lng REAL NOT NULL,
      monument_image_key TEXT NOT NULL DEFAULT '',
      monument_description TEXT NOT NULL DEFAULT '',
      cultural_significance TEXT NOT NULL DEFAULT '',
      monument_attribution TEXT DEFAULT '',
      gallery_images_json TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT '',
      history TEXT NOT NULL DEFAULT '',
      festivals_json TEXT NOT NULL DEFAULT '[]',
      arts_json TEXT NOT NULL DEFAULT '[]',
      cuisine_json TEXT NOT NULL DEFAULT '[]',
      traditions_json TEXT NOT NULL DEFAULT '[]',
      heritage_sites_json TEXT NOT NULL DEFAULT '[]',
      images_json TEXT NOT NULL DEFAULT '[]',
      sources_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      index_number TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      image_key TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS monuments (
      id TEXT PRIMARY KEY,
      district_id TEXT NOT NULL,
      district_name TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      cultural_significance TEXT NOT NULL,
      attribution TEXT DEFAULT '',
      created_by TEXT DEFAULT 'archive',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cultural_records (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      district TEXT NOT NULL,
      region TEXT NOT NULL,
      recognition_or_era TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      verified_facts_json TEXT NOT NULL DEFAULT '[]',
      preservation_note TEXT NOT NULL DEFAULT '',
      image_key TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      sources_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      content TEXT NOT NULL,
      district_id TEXT NOT NULL,
      district_name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      author_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED')),
      admin_feedback TEXT DEFAULT '',
      submitted_at TEXT DEFAULT NULL,
      reviewed_at TEXT DEFAULT NULL,
      published_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_favorite_monuments (
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      monument_id TEXT NOT NULL,
      monument_name TEXT NOT NULL,
      district_id TEXT NOT NULL,
      district_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (account_id, monument_id)
    );

    CREATE TABLE IF NOT EXISTS user_favorite_districts (
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      district_id TEXT NOT NULL,
      district_name TEXT NOT NULL,
      region TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (account_id, district_id)
    );

    CREATE TABLE IF NOT EXISTS user_recent_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL CHECK(item_type IN ('monument', 'district', 'culture', 'article')),
      item_id TEXT NOT NULL,
      item_title TEXT NOT NULL,
      district_id TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      route_path TEXT NOT NULL,
      viewed_at TEXT NOT NULL
    );
  `);

  seedInitialData(db);
  dbInstance = db;
  return db;
}

function seedInitialData(db: DatabaseSync): void {
  const now = new Date().toISOString();

  const districtCount = (db.prepare('SELECT COUNT(*) AS count FROM districts').get() as { count: number }).count;
  if (districtCount === 0) {
    const districtsPath = path.resolve(process.cwd(), 'public/data/districts.json');
    if (fs.existsSync(districtsPath)) {
      const districts = JSON.parse(fs.readFileSync(districtsPath, 'utf8')) as Array<Record<string, unknown>>;
      const insertDistrict = db.prepare(`
        INSERT INTO districts (
          id, name, region, division, documented, geo_boundary_note,
          monument_name, monument_location, monument_lat, monument_lng, monument_image_key,
          monument_description, cultural_significance, monument_attribution,
          gallery_images_json, description, history,
          festivals_json, arts_json, cuisine_json, traditions_json, heritage_sites_json,
          images_json, sources_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMonument = db.prepare(`
        INSERT INTO monuments (
          id, district_id, district_name, name, location, lat, lng,
          image_url, description, cultural_significance, attribution, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'archive', ?, ?)
      `);

      for (const d of districts) {
        const imgKey = String(d.monumentImageKey || 'hero-hampi');
        const imgUrl = imgKey.startsWith('/') ? imgKey : `/images/${imgKey}.jpg`;

        insertDistrict.run(
          String(d.id),
          String(d.name),
          String(d.region || ''),
          String(d.division || ''),
          d.documented ? 1 : 0,
          String(d.geoBoundaryNote || ''),
          String(d.monumentName || ''),
          String(d.monumentLocation || ''),
          Number(d.monumentLat || 14.5),
          Number(d.monumentLng || 75.8),
          imgKey,
          String(d.monumentDescription || ''),
          String(d.culturalSignificance || ''),
          String(d.monumentAttribution || ''),
          JSON.stringify(d.galleryImages || []),
          String(d.description || ''),
          String(d.history || ''),
          JSON.stringify(d.festivals || []),
          JSON.stringify(d.arts || []),
          JSON.stringify(d.cuisine || []),
          JSON.stringify(d.traditions || []),
          JSON.stringify(d.heritageSites || []),
          JSON.stringify(d.images || []),
          JSON.stringify(d.sources || []),
          now,
        );

        insertMonument.run(
          `mon-${String(d.id)}`,
          String(d.id),
          String(d.name),
          String(d.monumentName || d.name),
          String(d.monumentLocation || d.name),
          Number(d.monumentLat || 14.5),
          Number(d.monumentLng || 75.8),
          imgUrl,
          String(d.monumentDescription || d.description || ''),
          String(d.culturalSignificance || ''),
          String(d.monumentAttribution || ''),
          now,
          now,
        );
      }
    }
  }

  const categoryCount = (db.prepare('SELECT COUNT(*) AS count FROM categories').get() as { count: number }).count;
  if (categoryCount === 0) {
    const categoriesPath = path.resolve(process.cwd(), 'public/data/cultural-categories.json');
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8')) as Array<Record<string, unknown>>;
      const insertCat = db.prepare(`
        INSERT INTO categories (slug, index_number, title, subtitle, description, image_key, alt_text, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      categories.forEach((c, idx) => {
        insertCat.run(
          String(c.slug),
          String(c.indexNumber || String(idx + 1).padStart(2, '0')),
          String(c.title),
          String(c.subtitle || ''),
          String(c.description || ''),
          String(c.imageKey || 'hero-hampi'),
          String(c.altText || ''),
          idx + 1,
        );
      });
    }
  }

  const recordCount = (db.prepare('SELECT COUNT(*) AS count FROM cultural_records').get() as { count: number }).count;
  if (recordCount === 0) {
    const recordsPath = path.resolve(process.cwd(), 'public/data/cultural-records.json');
    if (fs.existsSync(recordsPath)) {
      const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8')) as Array<Record<string, unknown>>;
      const insertRec = db.prepare(`
        INSERT INTO cultural_records (
          id, slug, title, category_slug, district, region, recognition_or_era,
          summary, description, verified_facts_json, preservation_note,
          image_key, alt_text, sources_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of records) {
        insertRec.run(
          String(r.id),
          String(r.slug),
          String(r.title),
          String(r.categorySlug),
          String(r.district),
          String(r.region),
          String(r.recognitionOrEra || ''),
          String(r.summary || ''),
          String(r.description || ''),
          JSON.stringify(r.verifiedFacts || []),
          String(r.preservationNote || ''),
          String(r.imageKey || 'hero-hampi'),
          String(r.altText || ''),
          JSON.stringify(r.sources || []),
          now,
        );
      }
    }
  }
}
