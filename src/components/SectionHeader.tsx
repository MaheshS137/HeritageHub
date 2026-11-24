import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  kicker,
  title,
  description,
  actionLabel,
  actionTo,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-5 pb-8 border-b border-[#EADEC8] ${
        align === 'center'
          ? 'items-center text-center max-w-2xl mx-auto'
          : 'md:flex-row md:items-end md:justify-between'
      }`}
    >
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
          <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
          <span>{kicker}</span>
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#292522] leading-[1.15]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-[#77716B] leading-relaxed max-w-[62ch]">
            {description}
          </p>
        )}
      </div>

      {actionLabel && actionTo && (
        <div className="shrink-0">
          <Link
            to={actionTo}
            className="editorial-link inline-flex items-center gap-2 text-sm font-semibold text-[#C92332] hover:text-[#941D2A] py-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
