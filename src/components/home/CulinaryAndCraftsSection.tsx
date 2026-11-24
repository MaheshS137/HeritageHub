import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDistrictArchive } from '../../hooks/useDistrictArchive';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { PhotoCredit } from '../PhotoCredit';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';
import { RevealBlock, RevealSection, StaggerGrid, StaggerItem } from '../motion/MotionPrimitives';

export function CulinaryAndCraftsSection() {
  const { status, records } = useDistrictArchive();
  const { translateRecord, translateDistrict } = useI18n();

  if (status === 'error') return null;

  const cuisineItems = records.filter(
    (r) => r.categorySlug === 'food-cuisine' && Boolean(r.imageKey),
  );
  const leadCuisine =
    cuisineItems.find((r) => r.id === 'rec-udupi-vegetarian-cuisine') || cuisineItems[0];
  const secondaryCuisine = cuisineItems
    .filter((r) => r.id !== leadCuisine?.id)
    .slice(0, 6);

  const craftItems = records.filter(
    (r) => r.categorySlug === 'handicrafts-textiles' && Boolean(r.imageKey),
  );
  const leadCrafts = craftItems.slice(0, 2);
  const artisanGridCrafts = craftItems.slice(2, 6);

  return (
    <>
      {/* Band 3: Regional Culinary Traditions */}
      <RevealSection className="bg-[#FFFDF7] py-16 lg:py-22 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker="Regional Gastronomy & GI Confections"
            title="Culinary Traditions of Karnataka"
            description="From coastal temple vegetarian feasts and Dharwad's slow-caramelized peda to North Karnataka's jowar rotti and Old Mysore's ragi staples."
            actionLabel="Explore Karnataka Cuisine"
            actionTo="/culture?category=food-cuisine"
          />

          {status === 'loading' ? (
            <div className="mt-10 space-y-8" aria-busy="true">
              <div className="h-80 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-72 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {leadCuisine && (
                <RevealBlock className="mt-10">
                  {(() => {
                    const tr = translateRecord(leadCuisine);
                    const distSlug = leadCuisine.district
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-');
                    const distTr = translateDistrict({
                      id: distSlug,
                      name: leadCuisine.district,
                      monumentName: leadCuisine.title,
                    });
                    return (
                      <Link
                        to={`/culture/${leadCuisine.slug}`}
                        className="group grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_6px_22px_rgba(32,28,27,0.05)] hover:shadow-[0_14px_32px_rgba(148,29,42,0.11)] hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                      >
                        <HeritageImage
                          src={resolveHeritageImage(leadCuisine.imageKey)}
                          alt={leadCuisine.altText}
                          zoomOnHover
                          containerClassName="lg:col-span-6 aspect-[16/10] lg:aspect-auto lg:min-h-[360px] w-full"
                        />
                        <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between gap-6">
                          <div>
                            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#941D2A]">
                              {distTr.name} · {leadCuisine.region}
                            </p>
                            <h3 className="mt-2.5 font-serif text-2xl sm:text-3xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-tight">
                              {tr.title}
                            </h3>
                            <p className="mt-2 text-xs font-medium text-[#77716B]">
                              {leadCuisine.recognitionOrEra}
                            </p>
                            <p className="mt-4 text-sm sm:text-base text-[#77716B] leading-relaxed">
                              {tr.description}
                            </p>
                            <PhotoCredit imageKey={leadCuisine.imageKey} linked={false} className="mt-4" />
                          </div>
                          <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                            <span>Inspect Culinary Record</span>
                            <ArrowRight
                              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })()}
                </RevealBlock>
              )}

              <StaggerGrid className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-7">
                {secondaryCuisine.map((item) => {
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
                        className="group h-full flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_28px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
                            <h3 className="mt-1.5 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                              {tr.title}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-[#941D2A]">
                              {item.recognitionOrEra}
                            </p>
                            <p className="mt-2.5 text-sm text-[#77716B] leading-relaxed">
                              {tr.summary}
                            </p>
                            <PhotoCredit imageKey={item.imageKey} linked={false} className="mt-3" />
                          </div>
                          <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                            <span>Read Recipe Heritage</span>
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
            </>
          )}
        </div>
      </RevealSection>

      {/* Band 4: GI-Protected Handicrafts & Textiles */}
      <RevealSection className="bg-[#FFFFFF] py-16 lg:py-22 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <SectionHeader
            kicker="Geographical Indication Guilds"
            title="Handicrafts & Heritage Textiles"
            description="Signature Karnataka material traditions registered under India's Geographical Indications (GI) protection—silk weaving, lacquerware, silver inlay, and hand embroidery."
            actionLabel="All GI Crafts & Textiles"
            actionTo="/culture?category=handicrafts-textiles"
          />

          {status === 'loading' ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8" aria-busy="true">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-80 border border-[#EADEC8] bg-[#FFFDF7] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <StaggerGrid className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {leadCrafts.map((item) => {
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
                        className="group h-full flex flex-col bg-[#FFFDF7] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_14px_30px_rgba(148,29,42,0.11)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      >
                        <HeritageImage
                          src={resolveHeritageImage(item.imageKey)}
                          alt={item.altText}
                          zoomOnHover
                          containerClassName="aspect-[16/10] w-full"
                        />
                        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#941D2A]">
                              {distTr.name} · {item.recognitionOrEra}
                            </p>
                            <h3 className="mt-2 font-serif text-2xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                              {tr.title}
                            </h3>
                            <p className="mt-2.5 text-sm text-[#77716B] leading-relaxed">
                              {tr.summary}
                            </p>
                            <PhotoCredit imageKey={item.imageKey} linked={false} className="mt-3" />
                          </div>
                          <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                            <span>Explore Craft Monograph</span>
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

              {artisanGridCrafts.length > 0 && (
                <StaggerGrid className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {artisanGridCrafts.map((item) => {
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
                          className="group h-full flex flex-col bg-[#FFFDF7] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_14px_rgba(32,28,27,0.03)] hover:shadow-[0_12px_26px_rgba(148,29,42,0.1)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        >
                          <HeritageImage
                            src={resolveHeritageImage(item.imageKey)}
                            alt={item.altText}
                            zoomOnHover
                            containerClassName="aspect-[16/10] w-full"
                          />
                          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold text-[#941D2A]">
                                {distTr.name}
                              </p>
                              <h3 className="mt-1 font-serif text-lg font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-snug">
                                {tr.title}
                              </h3>
                              <p className="mt-2 text-xs text-[#77716B] leading-relaxed line-clamp-3">
                                {tr.summary}
                              </p>
                              <PhotoCredit imageKey={item.imageKey} linked={false} className="mt-2.5" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C92332] pt-2 border-t border-[#EADEC8]">
                              <span>Inspect Craft</span>
                              <ArrowRight
                                className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
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
            </>
          )}
        </div>
      </RevealSection>
    </>
  );
}
