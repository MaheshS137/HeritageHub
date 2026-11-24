import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDistrictArchive } from '../../hooks/useDistrictArchive';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { PhotoCredit } from '../PhotoCredit';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';
import { RevealSection, StaggerGrid, StaggerItem } from '../motion/MotionPrimitives';

export function FestivalsAndArtsSection() {
  const { status, records, retry } = useDistrictArchive();
  const { t, translateRecord, translateDistrict } = useI18n();

  const festivals = records
    .filter((r) => r.categorySlug === 'festivals-celebrations' && r.imageKey)
    .slice(0, 4);

  const performingArts = records
    .filter(
      (r) =>
        ['traditional-arts', 'folk-music-dance'].includes(r.categorySlug) &&
        Boolean(r.imageKey),
    )
    .slice(0, 6);

  if (status === 'error') {
    return (
      <section className="bg-[#FFFFFF] py-16 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 text-center">
          <p className="font-serif text-xl text-[#292522]">
            Cultural Festival &amp; Performing Arts Highlights Temporarily Unavailable
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md cursor-pointer"
          >
            Retry Loading Highlights
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Band 1: Festivals and Celebrations */}
      <RevealSection className="bg-[#FFFDF7] py-16 lg:py-22 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker={t('home.festivalsKicker')}
            title="Festivals & Ceremonial Gatherings"
            description="State festivals, processions, and seasonal harvest celebrations officially documented across Karnataka districts."
            actionLabel="All Festivals"
            actionTo="/culture?category=festivals-celebrations"
          />

          {status === 'loading' ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8" aria-busy="true">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-56 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <StaggerGrid className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-7">
              {festivals.map((item) => {
                const tr = translateRecord(item);
                const distSlug = item.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const distTr = translateDistrict({
                  id: distSlug,
                  name: item.district,
                  monumentName: item.title,
                });
                return (
                  <StaggerItem key={item.id}>
                    <Link
                      to={`/culture/${item.slug}`}
                      className="group h-full grid grid-cols-1 sm:grid-cols-12 items-stretch border border-[#EADEC8] bg-[#FFFFFF] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(item.imageKey)}
                        alt={item.altText}
                        zoomOnHover
                        containerClassName="sm:col-span-5 aspect-[16/10] sm:aspect-auto sm:min-h-[220px] w-full"
                      />
                      <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#941D2A]">
                            {distTr.name} · {item.recognitionOrEra}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                            {tr.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#77716B] leading-relaxed">{tr.summary}</p>
                          <PhotoCredit imageKey={item.imageKey} linked={false} className="mt-3" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332]">
                          <span>Inspect Festival Record</span>
                          <ArrowRight
                            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}
        </div>
      </RevealSection>

      {/* Band 2: Living Folk Arts & Performing Traditions */}
      <RevealSection className="bg-[#FFFFFF] py-16 lg:py-22 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker="Classical & Oral Theatre"
            title="Folk Arts & Performing Traditions"
            description="All-night Yakshagana bayalata dance-drama, Dollu Kunitha percussion, Veeragase, Kamsale, and Mysore court painting."
            actionLabel="Explore Performing Arts"
            actionTo="/culture?category=folk-music-dance"
          />

          {status === 'loading' ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-7" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 border border-[#EADEC8] bg-[#FFFDF7] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <StaggerGrid className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-7">
              {performingArts.map((item) => {
                const tr = translateRecord(item);
                const distSlug = item.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const distTr = translateDistrict({
                  id: distSlug,
                  name: item.district,
                  monumentName: item.title,
                });
                return (
                  <StaggerItem key={item.id}>
                    <Link
                      to={`/culture/${item.slug}`}
                      className="group h-full flex flex-col bg-[#FFFDF7] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(item.imageKey)}
                        alt={item.altText}
                        zoomOnHover
                        containerClassName="aspect-[16/10] w-full"
                      />
                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#77716B]">
                            {distTr.name} · {item.region}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                            {tr.title}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-[#941D2A]">
                            {item.recognitionOrEra}
                          </p>
                          <p className="mt-3 text-sm text-[#77716B] leading-relaxed">{tr.summary}</p>
                          <PhotoCredit imageKey={item.imageKey} linked={false} className="mt-3" />
                        </div>
                        <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                          <span>Verified Citation</span>
                          <ArrowRight
                            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}
        </div>
      </RevealSection>
    </>
  );
}
