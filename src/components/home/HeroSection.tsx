import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { PhotoCredit } from '../PhotoCredit';
import { useI18n } from '../../i18n/I18nContext';
import { HERITAGE_EASE } from '../motion/MotionPrimitives';

interface HeroSlide {
  id: string;
  image: string;
  imageKey: string;
  landmark: string;
  district: string;
  era: string;
  detailTo: string;
  altText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hampi',
    image: '/images/hero-hampi.jpg',
    imageKey: 'hero-hampi',
    landmark: 'Vijaya Vittala Stone Chariot, Hampi',
    district: 'Vijayanagara District',
    era: 'Vijayanagara Empire · 15th–16th c. CE',
    detailTo: '/destinations/hampi-vittala-ensemble',
    altText:
      'The carved granite Garuda Stone Chariot and pillared mandapa of Vijaya Vittala Temple at Hampi in Vijayanagara district, Karnataka.',
  },
  {
    id: 'mysuru',
    image: '/images/mysore-palace.jpg',
    imageKey: 'mysore-palace',
    landmark: 'Amba Vilas (Mysore Palace)',
    district: 'Mysuru District',
    era: 'Wadiyar Royal Court · 1912 CE',
    detailTo: '/destinations/mysore-palace',
    altText:
      'Amba Vilas (Mysore Palace) illuminated at dusk with arched colonnades, domes, and ceremonial courtyards in Mysuru.',
  },
  {
    id: 'belur',
    image: '/images/belur-hoysala.jpg',
    imageKey: 'belur-hoysala',
    landmark: 'Chennakesava Temple, Belur',
    district: 'Hassan District',
    era: 'Hoysala Dynasty · 1117 CE',
    detailTo: '/destinations/belur-hoysala-temples',
    altText:
      'Illuminated exterior of Chennakesava Temple in Belur showing its stellate Hoysala plinth and carved chloritic schist superstructure.',
  },
  {
    id: 'badami',
    image: '/images/badami-caves.jpg',
    imageKey: 'badami-caves',
    landmark: 'Badami Rock-Cut Cave Sanctuaries',
    district: 'Bagalkot District',
    era: 'Early Chalukyas · 6th c. CE',
    detailTo: '/district/bagalkot',
    altText:
      'Sandstone cliff cave temple sanctuary overlooking Agastya Tirtha lake at Badami in Bagalkot district, Karnataka.',
  },
  {
    id: 'yakshagana',
    image: '/images/yakshagana.jpg',
    imageKey: 'yakshagana',
    landmark: 'Yakshagana Classical Theatre',
    district: 'Udupi & Coastal Karnataka',
    era: 'Living Folk Tradition · 16th c. – Present',
    detailTo: '/culture?category=folk-music-dance',
    altText:
      'Yakshagana performer in ornate crown and traditional costume during a live stage performance in Karnataka.',
  },
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({});
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  const { t } = useI18n();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.09]);

  useEffect(() => {
    if (isPaused || prefersReduced) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReduced]);

  const activeSlide = HERO_SLIDES[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      ref={heroRef}
      aria-label="Karnataka Heritage Hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[70vh] lg:min-h-[78vh] flex flex-col justify-end overflow-hidden bg-[#201C1B]"
    >
      {/* Parallax Background Slide Stack */}
      <motion.div
        style={prefersReduced ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 w-full h-full will-change-transform pointer-events-none"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={activeSlide.id}
            src={activeSlide.image}
            alt={activeSlide.altText}
            referrerPolicy="no-referrer"
            onLoad={() =>
              setLoadedKeys((prev) => ({ ...prev, [activeSlide.imageKey]: true }))
            }
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
            animate={{
              opacity: loadedKeys[activeSlide.imageKey] === false ? 0 : 1,
              scale: 1,
            }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.85, ease: HERITAGE_EASE }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
      </motion.div>

      {/* Rich editorial charcoal scrim with subtle crimson warmth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#201C1B]/95 via-[#201C1B]/58 to-[#941D2A]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#201C1B]/88 via-[#201C1B]/42 to-transparent"
      />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-5 sm:px-8 pt-24 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          {/* Primary Editorial Hero Column */}
          <div className="lg:col-span-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: HERITAGE_EASE }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <span className="inline-block w-8 h-[3px] bg-[#F8C928]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8C928]">
                {t('hero.kicker')}
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: HERITAGE_EASE }}
              className="font-serif text-[#FFFFFF] text-[clamp(2.45rem,4.9vw,4.35rem)] font-medium leading-[1.06] tracking-tight"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.16, ease: HERITAGE_EASE }}
              className="mt-5 text-base sm:text-lg text-[#FFFDF7]/90 leading-relaxed max-w-[58ch]"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.24, ease: HERITAGE_EASE }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
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
            </motion.div>
          </div>

          {/* Right Editorial Slide Plate & Controls */}
          <div className="lg:col-span-4 lg:justify-self-end w-full lg:max-w-sm">
            <div className="border border-[#FFFDF7]/20 bg-[#201C1B]/78 backdrop-blur-md rounded-xl p-4 sm:p-5 text-[#FFFDF7]">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#FFFDF7]/15">
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#F8C928] tabular-nums">
                  Scene {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(HERO_SLIDES.length).padStart(2, '0')}
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous featured monument slide"
                    className="w-8 h-8 rounded-md border border-[#FFFDF7]/20 hover:border-[#F8C928] hover:text-[#F8C928] inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next featured monument slide"
                    className="w-8 h-8 rounded-md border border-[#FFFDF7]/20 hover:border-[#F8C928] hover:text-[#F8C928] inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: HERITAGE_EASE }}
                  className="pt-3 space-y-1.5"
                >
                  <p className="text-xs font-medium text-[#FFFDF7]/75">
                    {activeSlide.district} · {activeSlide.era}
                  </p>
                  <Link
                    to={activeSlide.detailTo}
                    className="group inline-flex items-center gap-1.5 font-serif text-lg font-medium text-[#FFFFFF] hover:text-[#F8C928] transition-colors"
                  >
                    <span>{activeSlide.landmark}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-[#F8C928] transition-transform duration-200 group-hover:translate-x-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                  <PhotoCredit
                    imageKey={activeSlide.imageKey}
                    className="text-[11px] text-[#FFFDF7]/70 [&_a]:text-[#F8C928]/90 [&_a:hover]:text-[#F8C928]"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Numbered Slide Progress Selectors */}
              <div className="mt-4 grid grid-cols-5 gap-1.5" role="tablist" aria-label="Hero showcase slides">
                {HERO_SLIDES.map((slide, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Show ${slide.landmark}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`py-1.5 rounded-sm text-[11px] font-semibold tabular-nums transition-colors cursor-pointer border ${
                        active
                          ? 'bg-[#F8C928] text-[#201C1B] border-[#F8C928]'
                          : 'bg-[#FFFDF7]/5 text-[#FFFDF7]/75 border-[#FFFDF7]/15 hover:border-[#F8C928]/60 hover:text-[#FFFFFF]'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Karnataka Red & Yellow Ribbon Accent */}
      <div className="relative z-10 hh-karnataka-rule w-full" aria-hidden="true" />
    </section>
  );
}
