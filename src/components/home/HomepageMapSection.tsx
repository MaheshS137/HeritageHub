import { Link } from 'react-router-dom';
import { useDistrictArchive } from '../../hooks/useDistrictArchive';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { KarnatakaInteractiveMap } from '../map/KarnatakaInteractiveMap';
import { SectionHeader } from '../SectionHeader';
import { useI18n } from '../../i18n/I18nContext';

export function HomepageMapSection() {
  const { status, districts, errorMessage, retry } = useDistrictArchive();
  const { ref, visible } = useRevealOnScroll<HTMLElement>(0.06);
  const { t } = useI18n();

  return (
    <section
      ref={ref}
      id="karnataka-interactive-map"
      aria-labelledby="homepage-map-heading"
      className={`bg-[#FFFDF7] py-16 lg:py-20 border-b border-[#EADEC8] hh-reveal ${
        visible ? 'is-visible' : ''
      }`}
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
      </div>
    </section>
  );
}
