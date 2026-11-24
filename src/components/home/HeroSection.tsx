import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { HERO_MEDIA } from '../../data/heritageData';
import { useI18n } from '../../i18n/I18nContext';

export function HeroSection() {
  const [imgFailed, setImgFailed] = useState(false);
  const { t } = useI18n();

  return (
    <section
      aria-label="Karnataka Heritage Hero"
      className="relative w-full min-h-[68vh] lg:min-h-[74vh] flex flex-col justify-end overflow-hidden bg-[#201C1B]"
    >
      {!imgFailed && (
        <img
          src={HERO_MEDIA.image}
          alt={HERO_MEDIA.altText}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Rich editorial charcoal scrim with subtle crimson warmth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#201C1B]/95 via-[#201C1B]/60 to-[#941D2A]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#201C1B]/85 via-[#201C1B]/40 to-transparent"
      />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-5 sm:px-8 pt-24 pb-14 sm:pb-16">
        <div className="max-w-3xl hh-hero-enter">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="inline-block w-8 h-[3px] bg-[#F8C928]" aria-hidden="true" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8C928]">
              {t('hero.kicker')}
            </p>
          </div>

          <h1 className="font-serif text-[#FFFFFF] text-[clamp(2.4rem,4.7vw,4.25rem)] font-medium leading-[1.06] tracking-tight">
            {t('hero.title')}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#FFFDF7]/90 leading-relaxed max-w-[58ch]">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 hh-hero-enter-delay">
            <Link
              to="/culture"
              className="hh-btn-interactive inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[46px] text-sm font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8C928]"
            >
              <span>{t('hero.exploreHeritage')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <a
              href="#karnataka-interactive-map"
              className="hh-btn-interactive inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] text-sm font-semibold text-[#201C1B] bg-[#F8C928] hover:bg-[#eab915] rounded-md whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>{t('hero.discoverDistricts')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Karnataka Red & Yellow Ribbon Accent */}
      <div className="relative z-10 hh-karnataka-rule w-full" aria-hidden="true" />
    </section>
  );
}
