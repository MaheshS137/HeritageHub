import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '../../data/heritageData';
import { HeritageImage } from '../HeritageImage';
import { PhotoCredit } from '../PhotoCredit';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';
import { RevealBlock, RevealSection, StaggerGrid, StaggerItem } from '../motion/MotionPrimitives';

export function FeaturedDestinations() {
  const { t } = useI18n();
  const featured = DESTINATIONS.filter((d) => d.featured);
  const leadDestination = featured[0];
  const secondaryDestinations = featured.slice(1, 4);

  return (
    <RevealSection
      aria-labelledby="destinations-heading"
      className="bg-[#FFFFFF] py-16 lg:py-22 border-b border-[#EADEC8]"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <SectionHeader
          kicker={t('home.destinationsKicker')}
          title={t('home.destinationsTitle')}
          description="Monuments selected for historical significance, craftsmanship, and active architectural preservation initiatives."
          actionLabel={t('home.allMonuments')}
          actionTo="/destinations"
        />

        {/* Lead Destination Widescreen Split Feature */}
        {leadDestination && (
          <RevealBlock className="mt-10">
            <Link
              to={`/destinations/${leadDestination.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#FFFDF7] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_6px_22px_rgba(32,28,27,0.05)] hover:shadow-[0_14px_32px_rgba(148,29,42,0.11)] hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
            >
              <HeritageImage
                src={leadDestination.image}
                alt={leadDestination.altText}
                zoomOnHover
                containerClassName="lg:col-span-7 aspect-[16/9] lg:aspect-auto lg:min-h-[430px] w-full"
              />

              <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#941D2A]">
                    {leadDestination.unescoStatus}
                  </p>

                  <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-tight">
                    {leadDestination.name}
                  </h3>

                  <p className="mt-3 text-xs text-[#77716B] tabular-nums">
                    {leadDestination.district} District · {leadDestination.dynasty} ·{' '}
                    {leadDestination.era}
                  </p>

                  <p className="mt-5 text-sm sm:text-base text-[#77716B] leading-relaxed">
                    {leadDestination.editorialIntro}
                  </p>

                  <PhotoCredit imageKey={leadDestination.imageKey} linked={false} className="mt-4" />
                </div>

                <div className="pt-5 border-t border-[#EADEC8] flex items-center justify-between gap-4">
                  <span className="text-xs text-[#77716B]">
                    Best Season:{' '}
                    <strong className="font-semibold text-[#292522]">
                      {leadDestination.visitingSeason}
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0">
                    <span>Read Monograph</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </RevealBlock>
        )}

        {/* Secondary Three Destinations (16:10 Widescreen Photography) */}
        <StaggerGrid className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-7">
          {secondaryDestinations.map((dest) => (
            <StaggerItem key={dest.slug}>
              <Link
                to={`/destinations/${dest.slug}`}
                className="group h-full flex flex-col bg-[#FFFDF7] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
              >
                <HeritageImage
                  src={dest.image}
                  alt={dest.altText}
                  zoomOnHover
                  containerClassName="aspect-[16/10] w-full"
                />

                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#77716B] tabular-nums">
                      {dest.district} · {dest.era}
                    </p>
                    <h3 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-snug">
                      {dest.name}
                    </h3>
                    <p className="mt-2.5 text-sm text-[#77716B] leading-relaxed">{dest.summary}</p>
                    <PhotoCredit imageKey={dest.imageKey} linked={false} className="mt-3" />
                  </div>

                  <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#941D2A]">
                    <span>{dest.dynasty}</span>
                    <span className="inline-flex items-center gap-1.5 group-hover:text-[#C92332] transition-colors">
                      <span>Explore</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </RevealSection>
  );
}
