import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import { useDistrictArchive } from '../../hooks/useDistrictArchive';
import { KarnatakaInteractiveMap } from '../map/KarnatakaInteractiveMap';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';
import { RevealBlock, RevealSection, StaggerGrid, StaggerItem } from '../motion/MotionPrimitives';

const REGION_EDITORIAL_NOTES: Record<string, { kicker: string; highlights: string }> = {
  'Old Mysore': {
    kicker: 'Palaces, Silk & Sacred Lakes',
    highlights: 'Mysuru, Hassan, Mandya, Kodagu, Chikkamagaluru, Ramanagara, Tumakuru & Kolar',
  },
  'Deccan Plateau': {
    kicker: 'Rock-Cut Sanctuaries & Hill Forts',
    highlights: 'Vijayanagara (Hampi), Bagalkot (Badami & Pattadakal), Chitradurga & Gadag',
  },
  'Malnad & Coast': {
    kicker: 'Karavali Shrines & Yakshagana Coast',
    highlights: 'Udupi, Dakshina Kannada, Uttara Kannada & Shivamogga rainforest temples',
  },
  'Kalyana & North': {
    kicker: 'Deccan Sultanate Domes & Bidriware',
    highlights: 'Vijayapura, Bidar, Kalaburagi, Belagavi, Raichur, Koppal & Yadgir',
  },
};

export function HomepageMapSection() {
  const { status, districts, errorMessage, retry } = useDistrictArchive();
  const { t, translateRegion } = useI18n();

  const regionSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of districts) {
      if (d.region) {
        counts.set(d.region, (counts.get(d.region) ?? 0) + 1);
      }
    }
    return ['Old Mysore', 'Deccan Plateau', 'Malnad & Coast', 'Kalyana & North'].map((region) => ({
      region,
      count: counts.get(region) ?? 0,
      ...(REGION_EDITORIAL_NOTES[region] || { kicker: 'Karnataka Region', highlights: '' }),
    }));
  }, [districts]);

  return (
    <RevealSection
      id="karnataka-interactive-map"
      aria-labelledby="homepage-map-heading"
      className="bg-[#FFFDF7] py-16 lg:py-20 border-b border-[#EADEC8]"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <SectionHeader
          kicker={t('map.sectionKicker')}
          title={t('map.sectionTitle')}
          description={t('map.sectionDesc')}
          actionLabel={t('map.openFullExplorer')}
          actionTo="/explore"
        />

        <div className="mt-10">
          {status === 'error' ? (
            <div className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-8 text-center">
              <p className="font-serif text-xl text-[#292522]">
                Unable to Load District Archive Data
              </p>
              <p className="mt-2 text-sm text-[#77716B]">{errorMessage}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-5 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md cursor-pointer"
              >
                Retry Loading Map Data
              </button>
            </div>
          ) : (
            <KarnatakaInteractiveMap districts={districts} variant="homepage" />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#77716B]">
          <span>
            Select any monument marker above or open{' '}
            <Link to="/explore" className="text-[#941D2A] font-semibold hover:underline">
              Explore Karnataka
            </Link>{' '}
            for full-screen filtering and district navigation.
          </span>
          <span>Real boundaries · 31 District Monuments · Leaflet GeoJSON</span>
        </div>

        {/* Incredible India inspired 4-Region Karnataka Discovery Strip */}
        {status === 'ready' && (
          <RevealBlock className="mt-12 pt-10 border-t border-[#EADEC8]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
                  <Compass className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                  <span>Browse by Geographic Region</span>
                </p>
                <h3 className="mt-1.5 font-serif text-2xl font-medium text-[#292522]">
                  Four Cultural Regions of Karnataka
                </h3>
              </div>
              <Link
                to="/explore"
                className="editorial-link text-xs font-semibold text-[#C92332] whitespace-nowrap shrink-0"
              >
                View All 31 Districts →
              </Link>
            </div>

            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {regionSummary.map((item) => (
                <StaggerItem key={item.region}>
                  <Link
                    to={`/explore?region=${encodeURIComponent(item.region)}`}
                    className="group h-full flex flex-col justify-between gap-3 p-5 rounded-xl border border-[#EADEC8] bg-[#FFFFFF] hover:border-[#C92332] hover:bg-[#FBF6E8]/70 shadow-[0_3px_12px_rgba(32,28,27,0.03)] hover:shadow-[0_10px_24px_rgba(148,29,42,0.09)] hover:-translate-y-0.5 transition-[transform,border-color,background-color,box-shadow] duration-250"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#941D2A] tabular-nums">
                        <span>{item.count} Districts</span>
                        <ArrowUpRight
                          className="w-4 h-4 text-[#C92332] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </div>
                      <h4 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                        {translateRegion(item.region)}
                      </h4>
                      <p className="mt-1 text-xs font-medium text-[#941D2A]">{item.kicker}</p>
                      <p className="mt-2 text-xs text-[#77716B] leading-relaxed">
                        {item.highlights}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </RevealBlock>
        )}
      </div>
    </RevealSection>
  );
}
