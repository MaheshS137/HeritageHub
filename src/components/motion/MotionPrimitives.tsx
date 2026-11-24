import { useRef, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react';

export const HERITAGE_EASE = [0.16, 1, 0.3, 1] as const;

export const HERITAGE_VIEWPORT = {
  once: true,
  amount: 'some' as const,
};

interface RevealSectionProps extends HTMLMotionProps<'section'> {
  children: ReactNode;
  delay?: number;
}

export function RevealSection({
  children,
  delay = 0,
  className = '',
  ...rest
}: RevealSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={HERITAGE_VIEWPORT}
      transition={{ duration: 0.44, delay, ease: HERITAGE_EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

interface RevealBlockProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function RevealBlock({
  children,
  delay = 0,
  className = '',
  ...rest
}: RevealBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={HERITAGE_VIEWPORT}
      transition={{ duration: 0.4, delay, ease: HERITAGE_EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerGrid({
  children,
  className = '',
  staggerDelay = 0.055,
}: StaggerGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={HERITAGE_VIEWPORT}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.04,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: HERITAGE_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionProps {
  routeKey: string;
  children: ReactNode;
}

export function PageTransition({ routeKey, children }: PageTransitionProps) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: HERITAGE_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgressBar({ className = '' }: { className?: string }) {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className={`h-[2px] w-full bg-gradient-to-r from-[#C92332] via-[#F8C928] to-[#941D2A] pointer-events-none ${className}`}
    />
  );
}

interface ParallaxFrameProps {
  children: ReactNode;
  className?: string;
  offsetPx?: number;
}

export function ParallaxFrame({
  children,
  className = '',
  offsetPx = 28,
}: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offsetPx, offsetPx]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={prefersReduced ? undefined : { y, scale: 1.07 }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
