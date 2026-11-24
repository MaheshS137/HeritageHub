import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCulturalData } from '../../hooks/useCulturalData';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';

export function FeaturedCategories() {
  const { status, categories, records } = useCulturalData();
  const { ref, visible } = useRevealOnScroll<HTMLElement>(0.08);
  const { t, translateCategory } = useI18n();

  const leadCategories = categories.slice(0, 4);
  const additionalCategories = categories.slice(4);

  return (
    <section
      ref={ref}
      aria-labelledby="categories-heading"
      className={`bg-[#FFFDF7] py-20 lg:py-24 border-b border-[#EADEC8] hh-reveal ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <SectionHeader
          kicker={t('home.categoriesKicker')}
          title={t('home.categoriesTitle')}
          description="Seven cultural pillars organizing Karnataka's festivals, traditional arts, folk music, historical monuments, regional cuisine, GI crafts, and sacred customs."
          actionLabel={t('home.allCategories')}
          actionTo="/culture"
        />

        {status === 'loading' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10" aria-busy="true">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-96 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {leadCategories.map((category) => {
                const count = records.filter((r) => r.categorySlug === category.slug).length;
                const tr = translateCategory(category);
                return (
                  <Link
                    key={category.slug}
                    to={`/culture?category=${category.slug}`}
                    className="group block bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.1)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                  >
                    <HeritageImage
                      src={resolveHeritageImage(category.imageKey)}
                      alt={category.altText}
                      zoomOnHover
                      containerClassName="aspect-[4/3] w-full"
                    />

                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between gap-4 text-xs text-[#77716B]">
                        <span className="font-semibold tracking-[0.16em] uppercase text-[#941D2A] tabular-nums">
                          {category.indexNumber} · {count}{' '}
                          {count === 1 ? 'Verified Record' : 'Verified Records'}
                        </span>
                      </div>

                      <div className="mt-3 flex items-start justify-between gap-4">
                        <h3 className="font-serif text-2xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                          {tr.title}
                        </h3>
                        <ArrowUpRight
                          className="w-5 h-5 text-[#C92332] shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="mt-2 text-sm font-medium text-[#941D2A]">{tr.subtitle}</p>
                      <p className="mt-3 text-sm text-[#77716B] leading-relaxed">
                        {tr.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {additionalCategories.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {additionalCategories.map((category) => {
                  const count = records.filter((r) => r.categorySlug === category.slug).length;
                  const tr = translateCategory(category);
                  return (
                    <Link
                      key={category.slug}
                      to={`/culture?category=${category.slug}`}
                      className="group block bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.1)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(category.imageKey)}
                        alt={category.altText}
                        zoomOnHover
                        containerClassName="aspect-[4/3] w-full"
                      />
                      <div className="p-6">
                        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A] tabular-nums">
                          {category.indexNumber} · {count}{' '}
                          {count === 1 ? 'Verified Record' : 'Verified Records'}
                        </p>
                        <div className="mt-2 flex items-start justify-between gap-3">
                          <h3 className="font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                            {tr.title}
                          </h3>
                          <ArrowUpRight
                            className="w-4 h-4 text-[#C92332] shrink-0 mt-1"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-2 text-sm text-[#77716B] leading-relaxed">{tr.subtitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
