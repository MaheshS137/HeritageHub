import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useDistrictArchive } from '../hooks/useDistrictArchive';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  kindLabel: string;
  to: string;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { districts, categories, records } = useDistrictArchive();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const results = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const hits: SearchHit[] = [];

    for (const d of districts) {
      const hay = [
        d.name,
        d.region,
        d.monumentName,
        d.monumentLocation,
        d.description,
        ...d.festivals,
        ...d.arts,
        ...d.cuisine,
        ...d.heritageSites,
      ]
        .join(' ')
        .toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          id: `dist-${d.id}`,
          title: d.name,
          subtitle: `${d.monumentName} · ${d.region}`,
          kindLabel: 'District & Monument',
          to: `/district/${d.id}`,
        });
      }
    }

    const catMap = new Map(categories.map((c) => [c.slug, c.title]));

    for (const rec of records) {
      const hay = [
        rec.title,
        rec.district,
        rec.summary,
        rec.recognitionOrEra,
        catMap.get(rec.categorySlug) ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          id: `rec-${rec.id}`,
          title: rec.title,
          subtitle: `${rec.district} District · ${rec.recognitionOrEra}`,
          kindLabel: catMap.get(rec.categorySlug) ?? 'Cultural Record',
          to: `/culture/${rec.slug}`,
        });
      }
    }

    for (const cat of categories) {
      if (
        cat.title.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q)
      ) {
        hits.push({
          id: `cat-${cat.slug}`,
          title: cat.title,
          subtitle: cat.subtitle,
          kindLabel: 'Category',
          to: `/culture?category=${cat.slug}`,
        });
      }
    }

    return hits.slice(0, 12);
  }, [query, districts, categories, records]);

  if (!isOpen) return null;

  const handleNavigate = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global HeritageHub Search"
      className="fixed inset-0 z-[1000] bg-[#201C1B]/65 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#EADEC8] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hh-karnataka-rule w-full" aria-hidden="true" />
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EADEC8] bg-[#FFFDF7]">
          <Search className="w-5 h-5 text-[#C92332] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search districts, monuments (e.g. Gol Gumbaz, Hampi), festivals, crafts..."
            aria-label="Search HeritageHub archive"
            className="flex-1 bg-transparent text-base text-[#292522] placeholder:text-[#77716B] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[#941D2A] hover:underline px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 text-[#77716B] hover:text-[#292522] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Suggestions or Results */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {!query.trim() ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77716B]">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Hampi',
                  'Gol Gumbaz',
                  'Mysuru Dasara',
                  'Murudeshwar',
                  'Yakshagana',
                  'Dharwad Peda',
                  'Bidriware',
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-xs font-medium border border-[#EADEC8] bg-[#FFFDF7] hover:border-[#C92332] hover:bg-[#FBF6E8] text-[#292522] rounded-md transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-serif text-lg text-[#292522]">
                No verified records match &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-[#77716B]">
                Try searching any of Karnataka&apos;s 31 districts (e.g., Mysuru, Vijayapura, Hassan, Bagalkot).
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EADEC8]">
              {results.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(hit.to)}
                    className="w-full text-left py-3.5 px-2 hover:bg-[#FBF6E8] transition-colors flex items-center justify-between gap-4 cursor-pointer rounded-md"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#941D2A]">{hit.kindLabel}</p>
                      <p className="font-serif text-base font-medium text-[#292522] truncate">
                        {hit.title}
                      </p>
                      <p className="text-xs text-[#77716B] truncate">{hit.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C92332] shrink-0" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
