import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDistrictArchive } from '../../hooks/useDistrictArchive';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';

export function FestivalsAndArtsSection() {
  const { status, records } = useDistrictArchive();
  const { ref: festRef, visible: festVisible } = useRevealOnScroll<HTMLElement>(0.08);
  const { ref: artsRef, visible: artsVisible } = useRevealOnScroll<HTMLElement>(0.08);
  const { t, translateRecord, translateDistrict } = useI18n();

  const festivals = records.filter((r) => r.categorySlug === 'festivals-celebrations');
  const artsAndCrafts = records.filter((r) =>
    ['traditional-arts', 'folk-music-dance', 'handicrafts-textiles'].includes(r.categorySlug),
  );

  if (status !== 'ready') return null;

  return (
    <>
      {/* Festivals and Celebrations */}
      <section
        ref={festRef}
        className={`bg-[#FFFFFF] py-20 lg:py-24 border-b border-[#EADEC8] hh-reveal ${
          festVisible ? 'is-visible' : ''
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker={t('home.festivalsKicker')}
            title={t('home.festivalsTitle')}
            description="State festivals and heritage celebrations officially documented by Karnataka cultural institutions."
            actionLabel={t('home.allCulture')}
            actionTo="/culture?category=festivals-celebrations"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {festivals.map((item) => {
              const tr = translateRecord(item);
              const distSlug = item.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const distTr = translateDistrict({
                id: distSlug,
                name: item.district,
                monumentName: item.title,
              });
              return (
                <Link
                  key={item.id}
                  to={`/culture/${item.slug}`}
                  className="group grid grid-cols-1 sm:grid-cols-12 items-stretch border border-[#EADEC8] bg-[#FFFDF7] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] transition-all"
                >
                  <HeritageImage
                    src={resolveHeritageImage(item.imageKey)}
                    alt={item.altText}
                    zoomOnHover
                    containerClassName="sm:col-span-5 aspect-[4/3] sm:aspect-auto w-full"
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
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332]">
                      <span>Inspect Festival Record</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Traditional Arts and Crafts */}
      <section
        ref={artsRef}
        className={`bg-[#FFFDF7] py-20 lg:py-24 border-b border-[#EADEC8] hh-reveal ${
          artsVisible ? 'is-visible' : ''
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker="Living Guilds & Performers"
            title="Traditional Arts & Crafts"
            description="Geographical Indication (GI) protected handicrafts, court painting schools, and recognized performing arts traditions."
            actionLabel="Explore Arts & Crafts"
            actionTo="/culture?category=traditional-arts"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {artsAndCrafts.slice(0, 6).map((item) => {
              const tr = translateRecord(item);
              const distSlug = item.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const distTr = translateDistrict({
                id: distSlug,
                name: item.district,
                monumentName: item.title,
              });
              return (
                <Link
                  key={item.id}
                  to={`/culture/${item.slug}`}
                  className="group flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_10px_24px_rgba(148,29,42,0.1)] transition-all"
                >
                  <HeritageImage
                    src={resolveHeritageImage(item.imageKey)}
                    alt={item.altText}
                    zoomOnHover
                    containerClassName="aspect-[4/3] w-full"
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
                    </div>
                    <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                      <span>Verified Citation</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
