import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SupportedLanguage = 'en' | 'kn' | 'hi';

type Dict = Record<string, unknown>;

interface HeritageTranslationBundle {
  categories?: Record<string, Record<string, { title?: string; subtitle?: string; description?: string }>>;
  regions?: Record<string, Record<string, string>>;
  records?: Record<string, Record<string, { title?: string; summary?: string; description?: string }>>;
  districts?: Record<string, Record<string, { name?: string; monumentName?: string }>>;
}

const DEFAULT_EN_DICT: Dict = {
  nav: {
    home: 'Home',
    explore: 'Explore Karnataka',
    culture: 'Cultural Heritage',
    about: 'About',
    search: 'Search',
    signIn: 'Sign In',
    dashboard: 'Dashboard',
    userDashboard: 'User Dashboard',
    journalistDashboard: 'Journalist Studio',
    adminDashboard: 'Admin Console',
    logout: 'Sign Out',
    language: 'Language',
  },
  hero: {
    kicker: 'Karnataka Cultural & Architectural Archive',
    title: 'Discover the Heritage of Karnataka',
    subtitle:
      "From Vijayanagara stone chariots and Hoysala soapstone temples to Yakshagana theatre, Mysore Dasara, and GI-protected crafts—explore every district's living cultural history.",
    exploreHeritage: 'Explore Heritage',
    discoverDistricts: 'Discover Districts',
  },
};

const STORAGE_KEY = 'hh_lang';

interface I18nContextValue {
  lang: SupportedLanguage;
  setLang: (next: SupportedLanguage) => void;
  t: (path: string, fallback?: string) => string;
  translateRegion: (region: string) => string;
  translateCategory: (cat: { slug: string; title: string; subtitle: string; description: string }) => {
    title: string;
    subtitle: string;
    description: string;
  };
  translateRecord: (rec: { id: string; title: string; summary: string; description: string }) => {
    title: string;
    summary: string;
    description: string;
    isTranslated: boolean;
  };
  translateDistrict: (dist: { id: string; name: string; monumentName: string }) => {
    name: string;
    monumentName: string;
    isTranslated: boolean;
  };
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolvePath(obj: Dict, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'kn' || saved === 'hi' || saved === 'en') return saved;
    } catch {
      // ignore storage failure
    }
    return 'en';
  });

  const [bundles, setBundles] = useState<Record<SupportedLanguage, Dict>>({
    en: DEFAULT_EN_DICT,
    kn: {},
    hi: {},
  });
  const [heritageTranslations, setHeritageTranslations] = useState<HeritageTranslationBundle>({});

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/locales/en.json').then((r) => (r.ok ? r.json() : DEFAULT_EN_DICT)),
      fetch('/locales/kn.json').then((r) => (r.ok ? r.json() : {})),
      fetch('/locales/hi.json').then((r) => (r.ok ? r.json() : {})),
      fetch('/data/translations-heritage.json').then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([en, kn, hi, heritage]) => {
        if (!active) return;
        setBundles({ en, kn, hi });
        setHeritageTranslations(heritage);
      })
      .catch(() => {
        // retain defaults gracefully
      });
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((next: SupportedLanguage) => {
    setLangState(next);
  }, []);

  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const primary = resolvePath(bundles[lang] || {}, keyPath);
      if (primary) return primary;
      const enVal = resolvePath(bundles.en || DEFAULT_EN_DICT, keyPath);
      return enVal || fallback || keyPath;
    },
    [bundles, lang],
  );

  const translateRegion = useCallback(
    (region: string): string => {
      if (lang === 'en') return region;
      return heritageTranslations.regions?.[region]?.[lang] || region;
    },
    [heritageTranslations, lang],
  );

  const translateCategory = useCallback(
    (cat: { slug: string; title: string; subtitle: string; description: string }) => {
      if (lang === 'en') {
        return { title: cat.title, subtitle: cat.subtitle, description: cat.description };
      }
      const tr = heritageTranslations.categories?.[cat.slug]?.[lang];
      return {
        title: tr?.title || cat.title,
        subtitle: tr?.subtitle || cat.subtitle,
        description: tr?.description || cat.description,
      };
    },
    [heritageTranslations, lang],
  );

  const translateRecord = useCallback(
    (rec: { id: string; title: string; summary: string; description: string }) => {
      if (lang === 'en') {
        return { title: rec.title, summary: rec.summary, description: rec.description, isTranslated: true };
      }
      const tr = heritageTranslations.records?.[rec.id]?.[lang];
      if (!tr) {
        return { title: rec.title, summary: rec.summary, description: rec.description, isTranslated: false };
      }
      return {
        title: tr.title || rec.title,
        summary: tr.summary || rec.summary,
        description: tr.description || rec.description,
        isTranslated: true,
      };
    },
    [heritageTranslations, lang],
  );

  const translateDistrict = useCallback(
    (dist: { id: string; name: string; monumentName: string }) => {
      if (lang === 'en') {
        return { name: dist.name, monumentName: dist.monumentName, isTranslated: true };
      }
      const tr = heritageTranslations.districts?.[dist.id]?.[lang];
      if (!tr) {
        return { name: dist.name, monumentName: dist.monumentName, isTranslated: false };
      }
      return {
        name: tr.name || dist.name,
        monumentName: tr.monumentName || dist.monumentName,
        isTranslated: true,
      };
    },
    [heritageTranslations, lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t,
      translateRegion,
      translateCategory,
      translateRecord,
      translateDistrict,
    }),
    [lang, setLang, t, translateRegion, translateCategory, translateRecord, translateDistrict],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
