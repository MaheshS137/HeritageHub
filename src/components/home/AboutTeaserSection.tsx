import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { RevealSection } from '../motion/MotionPrimitives';

export function AboutTeaserSection() {
  const { t } = useI18n();

  return (
    <RevealSection className="bg-[#FFFFFF] py-20 lg:py-24">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="border border-[#EADEC8] bg-[#201C1B] text-[#FFFDF7] rounded-xl p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden shadow-[0_14px_36px_rgba(32,28,27,0.12)]">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 hh-karnataka-rule"
          />

          <div className="lg:col-span-8 space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#F8C928]">
              {t('home.aboutKicker')}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#FFFFFF] leading-[1.15]">
              {t('home.aboutTitle')}
            </h2>
            <p className="text-base text-[#FFFDF7]/85 leading-relaxed max-w-[64ch]">
              {t('home.aboutBody')}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4">
            <Link
              to="/about"
              className="hh-btn-interactive inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] text-sm font-semibold text-[#201C1B] bg-[#F8C928] hover:bg-[#eab915] rounded-md whitespace-nowrap"
            >
              <span>{t('home.readAbout')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F8C928] hover:text-[#FFFFFF] py-1 transition-colors"
            >
              <span>Launch Full District Atlas →</span>
            </Link>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
