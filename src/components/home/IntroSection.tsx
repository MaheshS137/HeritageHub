import { Link } from 'react-router-dom';
import { useAnimatedCounter, useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { useI18n } from '../../i18n/I18nContext';

interface StatSpec {
  target: number;
  suffix: string;
  pad?: number;
  label: string;
  detail: string;
}

function AnimatedStatCard({ stat, active }: { stat: StatSpec; active: boolean }) {
  const count = useAnimatedCounter(stat.target, active, 950);
  const formatted =
    stat.pad && count < 10
      ? String(count).padStart(stat.pad, '0')
      : count.toLocaleString('en-US');

  return (
    <div className="space-y-2 p-6 rounded-xl border border-[#EADEC8] bg-[#FFFDF7]">
      <p className="font-serif text-4xl font-semibold text-[#C92332] tabular-nums">
        {formatted}
        {stat.suffix}
      </p>
      <h3 className="font-sans text-sm font-semibold tracking-wide text-[#292522]">
        {stat.label}
      </h3>
      <p className="text-sm text-[#77716B] leading-relaxed max-w-[36ch]">{stat.detail}</p>
    </div>
  );
}

export function IntroSection() {
  const { ref, visible } = useRevealOnScroll<HTMLElement>(0.12);
  const { t } = useI18n();

  const stats: StatSpec[] = [
    {
      target: 3,
      suffix: '',
      pad: 2,
      label: t('home.statPillars', 'UNESCO World Heritage Ensembles'),
      detail: 'Hampi, Pattadakal, and the Sacred Ensembles of the Hoysalas.',
    },
    {
      target: 31,
      suffix: '',
      label: t('home.statDistricts', 'Official Districts & Monuments'),
      detail: 'Interactive boundary geometry and curated monument records spanning every district.',
    },
    {
      target: 1400,
      suffix: '+',
      label: t('home.statSources', 'Source-Cited Years of Craft'),
      detail: 'From 6th-century Badami sandstone caves to living handloom guilds.',
    },
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="intro-heading"
      className={`bg-[#FFFFFF] py-20 lg:py-24 border-b border-[#EADEC8] hh-reveal ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Editorial Lead Column */}
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
              <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
              <span>{t('home.curatorialKicker')}</span>
            </p>
            <h2
              id="intro-heading"
              className="font-serif text-3xl sm:text-4xl font-medium text-[#292522] leading-[1.18]"
            >
              {t('home.curatorialTitle')}
            </h2>
          </div>

          {/* Prose Essay Column */}
          <div className="lg:col-span-7 space-y-5 text-base text-[#77716B] leading-relaxed max-w-[66ch]">
            <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-[#C92332] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.88] first-letter:pt-1">
              Karnataka holds one of the richest architectural and cultural continuums in South
              Asia—stretching from Early Chalukyan cliff sanctuaries along the Malaprabha basin to
              the musical granite halls of Vijayanagara and the rainforest shrines of the Western
              Ghats.
            </p>
            <p>
              HeritageHub brings together measured architectural monographs, regional craft records,
              and source-verified cultural data so students, travelers, and local stewards alike
              can explore every district with context, care, and lasting respect.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="editorial-link text-sm font-semibold text-[#C92332] hover:text-[#941D2A] py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
              >
                Explore our documentation standards &amp; sources →
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Archival Metrics Strip */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <AnimatedStatCard key={stat.label} stat={stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
