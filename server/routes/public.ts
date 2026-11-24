import express from 'express';
import { getDb } from '../db.ts';

export const publicRouter = express.Router();

export function mapDistrictRow(row: Record<string, unknown>) {
  const safeParse = (v: unknown) => {
    try {
      return JSON.parse(String(v || '[]'));
    } catch {
      return [];
    }
  };
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    division: row.division,
    documented: Boolean(row.documented),
    geoBoundaryNote: row.geo_boundary_note || undefined,
    monumentName: row.monument_name,
    monumentLocation: row.monument_location,
    monumentLat: row.monument_lat,
    monumentLng: row.monument_lng,
    monumentImageKey: row.monument_image_key,
    monumentDescription: row.monument_description,
    culturalSignificance: row.cultural_significance,
    monumentAttribution: row.monument_attribution || undefined,
    galleryImages: safeParse(row.gallery_images_json),
    description: row.description,
    history: row.history,
    festivals: safeParse(row.festivals_json),
    arts: safeParse(row.arts_json),
    cuisine: safeParse(row.cuisine_json),
    traditions: safeParse(row.traditions_json),
    heritageSites: safeParse(row.heritage_sites_json),
    images: safeParse(row.images_json),
    sources: safeParse(row.sources_json),
  };
}

export function mapCategoryRow(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    indexNumber: row.index_number,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    imageKey: row.image_key,
    altText: row.alt_text,
  };
}

export function mapRecordRow(row: Record<string, unknown>) {
  const safeParse = (v: unknown) => {
    try {
      return JSON.parse(String(v || '[]'));
    } catch {
      return [];
    }
  };
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categorySlug: row.category_slug,
    district: row.district,
    region: row.region,
    recognitionOrEra: row.recognition_or_era,
    summary: row.summary,
    description: row.description,
    verifiedFacts: safeParse(row.verified_facts_json),
    preservationNote: row.preservation_note,
    imageKey: row.image_key,
    altText: row.alt_text,
    sources: safeParse(row.sources_json),
  };
}

publicRouter.get('/districts', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM districts ORDER BY name ASC').all() as Array<Record<string, unknown>>;
  res.json(rows.map(mapDistrictRow));
});

publicRouter.get('/categories', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, title ASC').all() as Array<
    Record<string, unknown>
  >;
  res.json(rows.map(mapCategoryRow));
});

publicRouter.get('/records', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM cultural_records ORDER BY created_at ASC').all() as Array<
    Record<string, unknown>
  >;
  res.json(rows.map(mapRecordRow));
});

publicRouter.get('/monuments', (req, res) => {
  const districtId = String(req.query.districtId || '').trim();
  const db = getDb();
  const rows = districtId
    ? db.prepare('SELECT * FROM monuments WHERE district_id = ? ORDER BY name ASC').all(districtId)
    : db.prepare('SELECT * FROM monuments ORDER BY district_name ASC, name ASC').all();
  res.json({ monuments: rows });
});

publicRouter.get('/articles', (req, res) => {
  const districtId = String(req.query.district || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim().toLowerCase();
  const q = String(req.query.q || '').trim().toLowerCase();

  const db = getDb();
  let rows = db
    .prepare("SELECT * FROM articles WHERE status = 'PUBLISHED' ORDER BY published_at DESC")
    .all() as Array<Record<string, unknown>>;

  if (districtId && districtId !== 'all') {
    rows = rows.filter(
      (r) =>
        String(r.district_id || '').toLowerCase() === districtId ||
        String(r.district_name || '').toLowerCase() === districtId,
    );
  }
  if (category && category !== 'all') {
    rows = rows.filter((r) => String(r.category_slug || '').toLowerCase() === category);
  }
  if (q) {
    rows = rows.filter((r) =>
      `${r.title} ${r.short_description} ${r.district_name} ${r.author_name}`.toLowerCase().includes(q),
    );
  }

  res.json({ articles: rows });
});

publicRouter.get('/articles/:slug', (req, res) => {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM articles WHERE slug = ? AND status = 'PUBLISHED'")
    .get(req.params.slug);
  if (!row) {
    res.status(404).json({ error: 'Published article not found.' });
    return;
  }
  res.json({ article: row });
});
