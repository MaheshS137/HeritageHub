import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, PenTool, Search, X } from 'lucide-react';
import { useCulturalData } from '../hooks/useCulturalData';
import { CulturalRecordCard } from '../components/culture/CulturalRecordCard';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';
import { useI18n } from '../i18n/I18nContext';
import { resolveHeritageImage } from '../data/imageAssets';
import { HeritageImage } from '../components/HeritageImage';
import {
  HERITAGE_EASE,
  RevealSection,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';

interface PublishedArticle {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  district_id: string;
  district_name: string;
  category_slug: string;
  category_title: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
}

export function DiscoveryPage() {
  const { status, categories, districts, records, errorMessage, retry } = useCulturalData();
  const { lang, t, translateCategory, translateDistrict } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all',
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    searchParams.get('district') || 'all',
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [publishedArticles, setPublishedArticles] = useState<PublishedArticle[]>([]);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedDistrict(searchParams.get('district') || 'all');
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    fetch('/api/heritage/articles')
      .then((r) => (r.ok ? r.json() : { articles: [] }))
      .then((d) => {
        if (active) setPublishedArticles(d.articles || []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const updateUrlParams = (nextCat: string, nextDist: string, nextQ: string) => {
    const params = new URLSearchParams();
    if (nextCat !== 'all') params.set('category', nextCat);
    if (nextDist !== 'all') params.set('district', nextDist);
    if (nextQ.trim()) params.set('q', nextQ.trim());
    setSearchParams(params, { replace: true });
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams(slug, selectedDistrict, searchQuery);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    updateUrlParams(selectedCategory, districtName, searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrlParams(selectedCategory, selectedDistrict, value);
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.slug, translateCategory(cat).title);
    }
    return map;
  }, [categories, translateCategory]);

  const districtRecordCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of districts) {
      counts.set(d.name, 0);
    }
    for (const rec of records) {
      counts.set(rec.district, (counts.get(rec.district) ?? 0) + 1);
    }
    return counts;
  }, [districts, records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      const matchesCat = selectedCategory === 'all' || rec.categorySlug === selectedCategory;
      const matchesDist = selectedDistrict === 'all' || rec.district === selectedDistrict;
      const matchesQuery =
        !q ||
        rec.title.toLowerCase().includes(q) ||
        rec.district.toLowerCase().includes(q) ||
        rec.summary.toLowerCase().includes(q) ||
        rec.recognitionOrEra.toLowerCase().includes(q) ||
        rec.sources.some((s) => s.organization.toLowerCase().includes(q));
      return matchesCat && matchesDist && matchesQuery;
    });
  }, [records, selectedCategory, selectedDistrict, searchQuery]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedArticles.filter((art) => {
      const matchesCat = selectedCategory === 'all' || art.category_slug === selectedCategory;
      const matchesDist = selectedDistrict === 'all' || art.district_name === selectedDistrict;
      const matchesQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.short_description.toLowerCase().includes(q) ||
        art.district_name.toLowerCase().includes(q) ||
        art.author_name.toLowerCase().includes(q);
      return matchesCat && matchesDist && matchesQuery;
    });
  }, [publishedArticles, selectedCategory, selectedDistrict, searchQuery]);

  const selectedCategoryTitle =
    selectedCategory === 'all'
      ? null
      : categoryTitleMap.get(selectedCategory) ?? selectedCategory;

  const documentedDistrictCount = useMemo(
    () => Array.from(districtRecordCounts.values()).filter((c) => c > 0).length,
    [districtRecordCounts],
  );

  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      {/* Header */}
      <section className="border-b border-[#EADEC8] bg-[#FFFFFF] py-14 lg:py-16">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>{t('culture.kicker')}</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-3xl">
            {t('culture.title')}
          </h1>
          <p className="mt-4 text-base text-[#77716B] leading-relaxed max-w-[68ch]">
            {t('culture.subtitle')}
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-[#EADEC8] bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-6 space-y-5">
          {/* 7 Category Tabs */}
          {status === 'ready' && (
            <div
              role="tablist"
              aria-label="Filter cultural records by category"
              className="flex flex-wrap items-center gap-2"
            >
              {[
                { slug: 'all', label: t('culture.allCategories') },
                ...categories.map((cat) => ({
                  slug: cat.slug,
                  label: translateCategory(cat).title,
                })),
              ].map((tab) => {
                const isSelected = selectedCategory === tab.slug;
                return (
                  <button
                    key={tab.slug}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleCategoryChange(tab.slug)}
                    className={`relative px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'text-[#FFFFFF] border-[#C92332]'
                        : 'bg-[#FFFFFF] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="culture-category-tab-pill"
                        transition={{ duration: 0.24, ease: HERITAGE_EASE }}
                        className="absolute inset-0 bg-[#C92332] rounded-[5px]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 31-District Selector + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="flex-1 max-w-xs">
                <label htmlFor="district-select" className="sr-only">
                  Filter by Karnataka District (All 31 Districts)
                </label>
                <select
                  id="district-select"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522]"
                >
                  <option value="all">{t('culture.allDistricts')}</option>
                  {districts.map((dist) => {
                    const count = districtRecordCounts.get(dist.name) ?? 0;
                    const distSlug = dist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const trD = translateDistrict({
                      id: distSlug,
                      name: dist.name,
                      monumentName: dist.name,
                    });
                    return (
                      <option key={dist.name} value={dist.name}>
                        {trD.name} ({count === 0 ? 'No records yet' : `${count} verified`})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search
                  className="w-4 h-4 text-[#941D2A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('culture.searchPlaceholder')}
                  aria-label="Search cultural records"
                  className="w-full pl-9 pr-8 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522] placeholder:text-[#77716B]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#292522] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-[#77716B] tabular-nums">
              <span>
                Showing <strong className="text-[#292522]">{filteredRecords.length}</strong> of{' '}
                {records.length} verified records · {documentedDistrictCount}/{districts.length}{' '}
                districts cataloged
              </span>
              {(selectedCategory !== 'all' || selectedDistrict !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-[#C92332] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t('culture.resetFilters')}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-14">
          {status === 'loading' && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              aria-busy="true"
              aria-label="Loading verified cultural records"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          {status === 'error' && (
            <UnavailableNotice
              title="External Cultural Archive Unavailable"
              message={
                errorMessage ?? 'Unable to load the external JSON cultural resource files.'
              }
              onReset={retry}
              resetLabel="Retry Loading Records"
            />
          )}

          {status === 'ready' && filteredRecords.length === 0 && filteredArticles.length === 0 && (
            <UnavailableNotice
              title={
                selectedDistrict !== 'all'
                  ? `No Verified Records Yet for ${selectedDistrict} District`
                  : t('culture.unavailableTitle')
              }
              message={
                selectedDistrict !== 'all'
                  ? `Verified records for ${selectedDistrict} District${
                      selectedCategoryTitle ? ` under ${selectedCategoryTitle}` : ''
                    } have not yet been added to this edition of the HeritageHub archive.`
                  : t('culture.unavailableBody')
              }
              detail="HeritageHub publishes only entries backed by verified institutional sources (UNESCO, ASI, IP India GI Registry, or recognized cultural academies) and avoids unverified placeholder entries."
              onReset={resetAllFilters}
              resetLabel="View All Verified Records"
            />
          )}

          {status === 'ready' && filteredRecords.length > 0 && (
            <motion.div
              key={`${selectedCategory}-${selectedDistrict}-${searchQuery}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: HERITAGE_EASE }}
            >
              <h2 className="font-serif text-2xl font-medium text-[#292522] mb-6">
                {t('culture.verifiedArchiveTitle')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecords.map((rec) => (
                  <CulturalRecordCard
                    key={rec.id}
                    record={rec}
                    categoryTitle={categoryTitleMap.get(rec.categorySlug) ?? rec.categorySlug}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Published Journalist Features */}
          {status === 'ready' && filteredArticles.length > 0 && (
            <div className="pt-10 border-t border-[#EADEC8]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="font-serif text-2xl font-medium text-[#292522]">
                  {t('culture.communityArticlesTitle')}
                </h2>
                {lang !== 'en' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#941D2A]">
                    <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('culture.englishFallbackNote')}</span>
                  </span>
                )}
              </div>
              <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((art) => (
                  <StaggerItem key={art.id}>
                    <Link
                      to={`/article/${art.slug}`}
                      className="group h-full flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_14px_30px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                      {art.cover_image_url && (
                        <HeritageImage
                          src={resolveHeritageImage(art.cover_image_url)}
                          alt={art.title}
                          zoomOnHover
                          containerClassName="aspect-[4/3] w-full"
                        />
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#941D2A]">
                            {art.district_name} · {art.category_title}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] leading-snug">
                            {art.title}
                          </h3>
                          <p className="mt-3 text-sm text-[#77716B] leading-relaxed line-clamp-3">
                            {art.short_description}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 text-[#77716B]">
                            <PenTool className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                            <span>{art.author_name}</span>
                          </span>
                          <span className="font-semibold text-[#C92332]">Read Feature →</span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          )}
        </div>
      </section>

      {/* 31-District Archive Coverage Index */}
      {status === 'ready' && (
        <RevealSection className="py-16 border-t border-[#EADEC8] bg-[#FFFFFF]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                Statewide District Index
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                {t('culture.allDistricts')}
              </h2>
              <p className="mt-2 text-sm text-[#77716B]">
                Select any district below to inspect documented entries or verify current archival
                coverage status.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {districts.map((dist) => {
                const count = districtRecordCounts.get(dist.name) ?? 0;
                const isActive = selectedDistrict === dist.name;
                const distSlug = dist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const trD = translateDistrict({
                  id: distSlug,
                  name: dist.name,
                  monumentName: dist.name,
                });
                return (
                  <button
                    key={dist.name}
                    type="button"
                    onClick={() => {
                      handleDistrictChange(dist.name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-left px-3.5 py-2.5 border rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                        : count > 0
                          ? 'bg-[#FFFDF7] text-[#292522] border-[#EADEC8] hover:border-[#C92332] hover:bg-[#FBF6E8]'
                          : 'bg-[#FFFDF7]/60 text-[#77716B] border-[#EADEC8]/80 hover:border-[#C92332]'
                    }`}
                  >
                    <p className="text-xs font-medium truncate">{trD.name}</p>
                    <p
                      className={`text-[11px] mt-0.5 tabular-nums ${
                        isActive
                          ? 'text-[#F8C928]'
                          : count > 0
                            ? 'text-[#941D2A]'
                            : 'text-[#77716B]'
                      }`}
                    >
                      {count > 0 ? `${count} verified` : 'Awaiting records'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </RevealSection>
      )}
    </div>
  );
}
