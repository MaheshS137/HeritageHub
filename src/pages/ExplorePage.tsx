import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
import { useDistrictArchive } from '../hooks/useDistrictArchive';
import { resolveHeritageImage } from '../data/imageAssets';
import { HeritageImage } from '../components/HeritageImage';
import { KarnatakaInteractiveMap } from '../components/map/KarnatakaInteractiveMap';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';
import { useI18n } from '../i18n/I18nContext';
import {
  HERITAGE_EASE,
  RevealSection,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';

export function ExplorePage() {
  const { status, districts, categories, errorMessage, retry } = useDistrictArchive();
  const { t, translateDistrict, translateRegion, translateCategory } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDistrictId = searchParams.get('district');
  const initialRegion = searchParams.get('region') || 'all';

  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [cardQuery, setCardQuery] = useState<string>('');

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const d of districts) {
      if (d.region) set.add(d.region);
    }
    return Array.from(set);
  }, [districts]);

  const filteredDistrictCards = useMemo(() => {
    const q = cardQuery.trim().toLowerCase();
    return districts.filter((d) => {
      const matchesRegion = selectedRegion === 'all' || d.region === selectedRegion;
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.monumentName.toLowerCase().includes(q) ||
        d.monumentLocation.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [districts, selectedRegion, cardQuery]);

  const documentedCount = districts.filter((d) => d.documented).length;

  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      {/* Editorial Top Strip */}
      <section className="border-b border-[#EADEC8] bg-[#FFFFFF] py-10 lg:py-12">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
              <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
              <span>{t('map.sectionKicker')}</span>
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#292522] leading-[1.12]">
              {t('map.sectionTitle')}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#77716B] max-w-[64ch]">
              {t('map.sectionDesc')}
            </p>
          </div>

          {status === 'ready' && (
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#77716B] tabular-nums shrink-0">
              <div>
                <p className="font-serif text-2xl font-semibold text-[#C92332]">{districts.length}</p>
                <p>District Monuments</p>
              </div>
              <div className="h-8 w-px bg-[#EADEC8]" aria-hidden="true" />
              <div>
                <p className="font-serif text-2xl font-semibold text-[#C92332]">{documentedCount}</p>
                <p>Full Monographs</p>
              </div>
              <div className="h-8 w-px bg-[#EADEC8]" aria-hidden="true" />
              <div>
                <p className="font-serif text-2xl font-semibold text-[#C92332]">{categories.length}</p>
                <p>Cultural Categories</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Map Workspace */}
      <section className="py-8 lg:py-10 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          {status === 'error' ? (
            <UnavailableNotice
              title="Unable to Load Karnataka District Explorer"
              message={errorMessage ?? 'District data resources could not be loaded.'}
              onReset={retry}
              resetLabel="Retry Loading Explorer"
            />
          ) : (
            <KarnatakaInteractiveMap
              districts={districts}
              initialDistrictId={initialDistrictId}
              variant="explore"
            />
          )}
        </div>
      </section>

      {/* All 31 Districts & Monument Cards Directory */}
      {status === 'ready' && (
        <RevealSection className="py-14 lg:py-16 border-b border-[#EADEC8] bg-[#FFFDF7]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#EADEC8]">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                  <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
                  <span>Statewide Monument Directory</span>
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                  {t('culture.allDistricts')}
                </h2>
              </div>

              <div className="relative w-full lg:w-72">
                <Search
                  className="w-4 h-4 text-[#941D2A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={cardQuery}
                  onChange={(e) => setCardQuery(e.target.value)}
                  placeholder={t('map.searchPlaceholder')}
                  aria-label="Filter monument cards"
                  className="w-full pl-9 pr-8 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522] placeholder:text-[#77716B]"
                />
                {cardQuery && (
                  <button
                    type="button"
                    onClick={() => setCardQuery('')}
                    aria-label="Clear monument filter"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#292522] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {['all', ...regions].map((regionKey) => {
                const isSelected = selectedRegion === regionKey;
                const label =
                  regionKey === 'all'
                    ? `All Regions (${districts.length})`
                    : translateRegion(regionKey);
                return (
                  <button
                    key={regionKey}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(regionKey);
                      const next = new URLSearchParams(searchParams);
                      if (regionKey === 'all') next.delete('region');
                      else next.set('region', regionKey);
                      setSearchParams(next, { replace: true });
                    }}
                    className={`relative px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-[#FFFFFF] border-[#C92332]'
                        : 'bg-[#FFFFFF] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="explore-region-tab-pill"
                        transition={{ duration: 0.24, ease: HERITAGE_EASE }}
                        className="absolute inset-0 bg-[#C92332] rounded-[5px]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>

            {filteredDistrictCards.length === 0 ? (
              <UnavailableNotice
                title="No Matching District Monuments"
                message="No Karnataka districts match your current search or regional filter."
                onReset={() => {
                  setSelectedRegion('all');
                  setCardQuery('');
                }}
                resetLabel="Show All 31 Districts"
              />
            ) : (
              <motion.div
                key={`${selectedRegion}-${cardQuery}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: HERITAGE_EASE }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
              >
                {filteredDistrictCards.map((d) => {
                  const trD = translateDistrict(d);
                  return (
                    <Link
                      key={d.id}
                      to={`/district/${d.id}`}
                      className="group flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_14px_30px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(d.monumentImageKey)}
                        alt={`${d.monumentName} in ${d.name}`}
                        zoomOnHover
                        containerClassName="aspect-[4/3] w-full"
                      />
                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#941D2A]">
                            {trD.name} · {translateRegion(d.region)}
                          </p>
                          <h3 className="mt-1.5 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-snug">
                            {trD.monumentName}
                          </h3>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#77716B]">
                            <MapPin className="w-3.5 h-3.5 text-[#C92332] shrink-0" aria-hidden="true" />
                            <span>{d.monumentLocation}</span>
                          </p>
                          <p className="mt-2.5 text-sm text-[#77716B] leading-relaxed line-clamp-3">
                            {d.monumentDescription}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                          <span>{d.documented ? 'Full Monograph' : 'Monument Profile'}</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span>{t('map.exploreDistrict')}</span>
                            <ArrowRight
                              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </div>
        </RevealSection>
      )}

      {/* Related Cultural Categories Strip */}
      {status === 'ready' && (
        <RevealSection className="py-14 lg:py-16 bg-[#FFFFFF]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EADEC8]">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                  Browse by Discipline
                </p>
                <h2 className="font-serif text-2xl font-medium text-[#292522]">
                  {t('home.categoriesTitle')}
                </h2>
              </div>
              <Link
                to="/culture"
                className="editorial-link text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0"
              >
                {t('home.allCategories')} →
              </Link>
            </div>

            <StaggerGrid className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const trCat = translateCategory(cat);
                return (
                  <StaggerItem key={cat.slug}>
                    <Link
                      to={`/culture?category=${cat.slug}`}
                      className="group h-full p-5 border border-[#EADEC8] bg-[#FFFDF7] hover:border-[#C92332] hover:bg-[#FBF6E8] rounded-xl shadow-[0_3px_10px_rgba(32,28,27,0.03)] hover:shadow-[0_10px_22px_rgba(148,29,42,0.09)] hover:-translate-y-0.5 transition-[transform,border-color,background-color,box-shadow] duration-250 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#941D2A] tabular-nums">
                          {cat.indexNumber}
                        </p>
                        <h3 className="mt-1 font-serif text-lg font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                          {trCat.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#77716B] leading-relaxed">
                          {trCat.subtitle}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332]">
                        <span>Explore</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </RevealSection>
      )}
    </div>
  );
}
