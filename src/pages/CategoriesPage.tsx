import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCulturalData } from '../hooks/useCulturalData';
import { resolveHeritageImage } from '../data/imageAssets';
import { HeritageImage } from '../components/HeritageImage';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';

export function CategoriesPage() {
  const { status, categories, records, errorMessage, retry } = useCulturalData();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusParam = searchParams.get('focus');
  const [activeSlug, setActiveSlug] = useState<string>(focusParam || 'all');

  useEffect(() => {
    if (focusParam && categories.some((c) => c.slug === focusParam)) {
      setActiveSlug(focusParam);
    } else if (!focusParam) {
      setActiveSlug('all');
    }
  }, [focusParam, categories]);

  const handleSelectCategory = (slug: string) => {
    setActiveSlug(slug);
    if (slug === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ focus: slug }, { replace: true });
    }
  };

  const visibleCategories =
    activeSlug === 'all'
      ? categories
      : categories.filter((cat) => cat.slug === activeSlug);

  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      <section className="border-b border-[#EADEC8] bg-[#FFFFFF] py-16 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>Taxonomic Archive · 7 Cultural Disciplines</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-3xl">
            Cultural Categories of Karnataka
          </h1>
          <p className="mt-4 text-base text-[#77716B] leading-relaxed max-w-[66ch]">
            All cultural records are loaded from verified JSON archive files and organized across
            seven disciplines—from state festivals and traditional paintings to GI-protected crafts
            and sacred forest customs.
          </p>

          {status === 'ready' && (
            <div
              role="tablist"
              aria-label="Filter cultural categories"
              className="mt-8 flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeSlug === 'all'}
                onClick={() => handleSelectCategory('all')}
                className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSlug === 'all'
                    ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                    : 'bg-[#FFFDF7] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                }`}
              >
                All 7 Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={activeSlug === cat.slug}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSlug === cat.slug
                      ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                      : 'bg-[#FFFDF7] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                  }`}
                >
                  {cat.indexNumber}. {cat.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          {status === 'loading' && (
            <div className="space-y-8" aria-busy="true" aria-label="Loading cultural categories">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-72 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          {status === 'error' && (
            <UnavailableNotice
              title="Unable to Load Cultural Categories"
              message={errorMessage ?? 'The category resource file could not be loaded.'}
              onReset={retry}
              resetLabel="Retry Loading Archive"
            />
          )}

          {status === 'ready' && (
            <div className="space-y-12">
              {visibleCategories.map((category) => {
                const matchingRecords = records.filter(
                  (rec) => rec.categorySlug === category.slug,
                );
                const imgSrc = resolveHeritageImage(category.imageKey);

                return (
                  <article
                    key={category.slug}
                    className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl overflow-hidden shadow-[0_4px_18px_rgba(32,28,27,0.04)]"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                      <HeritageImage
                        src={imgSrc}
                        alt={category.altText}
                        containerClassName="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[320px] w-full"
                      />

                      <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-6">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-semibold tracking-[0.16em] uppercase text-[#941D2A] tabular-nums">
                              Category {category.indexNumber} · {matchingRecords.length}{' '}
                              {matchingRecords.length === 1
                                ? 'Verified Record'
                                : 'Verified Records'}
                            </span>
                            <Link
                              to={`/culture?category=${category.slug}`}
                              className="editorial-link text-xs font-semibold text-[#C92332]"
                            >
                              Filter in Archive →
                            </Link>
                          </div>

                          <h2 className="mt-3 font-serif text-3xl font-medium text-[#292522]">
                            {category.title}
                          </h2>
                          <p className="mt-2 text-sm font-medium text-[#941D2A]">
                            {category.subtitle}
                          </p>
                          <p className="mt-4 text-base text-[#77716B] leading-relaxed">
                            {category.description}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-[#EADEC8]">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77716B] mb-3">
                            Verified Cultural Records
                          </h3>
                          {matchingRecords.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {matchingRecords.map((rec) => (
                                <Link
                                  key={rec.id}
                                  to={`/culture/${rec.slug}`}
                                  className="flex items-center justify-between gap-3 p-3.5 border border-[#EADEC8] bg-[#FFFDF7] hover:border-[#C92332] hover:bg-[#FBF6E8] rounded-lg transition-colors"
                                >
                                  <div className="min-w-0">
                                    <p className="font-serif text-sm font-medium text-[#292522] truncate">
                                      {rec.title}
                                    </p>
                                    <p className="text-xs text-[#77716B] truncate">
                                      {rec.district} District · {rec.sources.length}{' '}
                                      {rec.sources.length === 1 ? 'Citation' : 'Citations'}
                                    </p>
                                  </div>
                                  <ArrowRight
                                    className="w-4 h-4 text-[#C92332] shrink-0"
                                    aria-hidden="true"
                                  />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[#77716B]">
                              Verified cultural records for this category are currently being
                              compiled from institutional sources.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
