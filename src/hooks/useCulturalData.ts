import { useCallback, useEffect, useState } from 'react';
import type {
  CulturalCategoryResource,
  CulturalRecord,
  KarnatakaDistrictResource,
} from '../types/culture';

export interface CulturalDataState {
  status: 'loading' | 'ready' | 'error';
  categories: CulturalCategoryResource[];
  districts: KarnatakaDistrictResource[];
  records: CulturalRecord[];
  errorMessage: string | null;
  retry: () => void;
}

export function useCulturalData(): CulturalDataState {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [categories, setCategories] = useState<CulturalCategoryResource[]>([]);
  const [districts, setDistricts] = useState<KarnatakaDistrictResource[]>([]);
  const [records, setRecords] = useState<CulturalRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadResources() {
      setStatus('loading');
      setErrorMessage(null);

      try {
        const [catRes, distRes, recRes] = await Promise.all([
          fetch('/data/cultural-categories.json', { signal: controller.signal }),
          fetch('/data/karnataka-districts.json', { signal: controller.signal }),
          fetch('/data/cultural-records.json', { signal: controller.signal }),
        ]);

        if (!catRes.ok || !distRes.ok || !recRes.ok) {
          throw new Error('Unable to retrieve one or more cultural archive JSON files.');
        }

        const [catJson, distJson, recJson] = await Promise.all([
          catRes.json(),
          distRes.json(),
          recRes.json(),
        ]);

        if (!Array.isArray(catJson) || !Array.isArray(distJson) || !Array.isArray(recJson)) {
          throw new Error('Cultural archive JSON resources returned an unexpected format.');
        }

        if (!active) return;
        setCategories(catJson);
        setDistricts(distJson);
        setRecords(recJson);
        setStatus('ready');
      } catch (err) {
        if (!active || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading verified cultural records.',
        );
      }
    }

    loadResources();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return {
    status,
    categories,
    districts,
    records,
    errorMessage,
    retry,
  };
}
