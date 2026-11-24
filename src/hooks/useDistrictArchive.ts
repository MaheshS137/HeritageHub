import { useCallback, useEffect, useState } from 'react';
import type {
  CulturalCategoryResource,
  CulturalRecord,
} from '../types/culture';

export interface DistrictSource {
  title: string;
  organization: string;
  url: string;
}

export interface DistrictRecord {
  id: string;
  name: string;
  region: string;
  division: string;
  documented: boolean;
  geoBoundaryNote?: string;
  monumentName: string;
  monumentLocation: string;
  monumentLat: number;
  monumentLng: number;
  monumentImageKey: string;
  monumentDescription: string;
  culturalSignificance: string;
  monumentAttribution?: string;
  galleryImages: string[];
  description: string;
  history: string;
  festivals: string[];
  arts: string[];
  cuisine: string[];
  traditions: string[];
  heritageSites: string[];
  images: string[];
  sources: DistrictSource[];
}

export interface DistrictArchiveState {
  status: 'loading' | 'ready' | 'error';
  districts: DistrictRecord[];
  categories: CulturalCategoryResource[];
  records: CulturalRecord[];
  errorMessage: string | null;
  retry: () => void;
}

export function useDistrictArchive(): DistrictArchiveState {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [categories, setCategories] = useState<CulturalCategoryResource[]>([]);
  const [records, setRecords] = useState<CulturalRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadAll() {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const [distRes, catRes, recRes] = await Promise.all([
          fetch('/data/districts.json', { signal: controller.signal }),
          fetch('/data/cultural-categories.json', { signal: controller.signal }),
          fetch('/data/cultural-records.json', { signal: controller.signal }),
        ]);

        if (!distRes.ok || !catRes.ok || !recRes.ok) {
          throw new Error('Failed to load HeritageHub JSON archive resources.');
        }

        const [distJson, catJson, recJson] = await Promise.all([
          distRes.json(),
          catRes.json(),
          recRes.json(),
        ]);

        if (!Array.isArray(distJson) || !Array.isArray(catJson) || !Array.isArray(recJson)) {
          throw new Error('Archive JSON files returned unexpected data structures.');
        }

        if (!active) return;
        setDistricts(distJson);
        setCategories(catJson);
        setRecords(recJson);
        setStatus('ready');
      } catch (err) {
        if (!active || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to load Karnataka cultural data.',
        );
      }
    }

    loadAll();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { status, districts, categories, records, errorMessage, retry };
}
