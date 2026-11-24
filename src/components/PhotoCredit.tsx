import { ExternalLink } from 'lucide-react';
import { getImageAttribution } from '../data/imageAssets';

interface PhotoCreditProps {
  imageKey: string;
  className?: string;
  linked?: boolean;
}

export function PhotoCredit({ imageKey, className = '', linked = true }: PhotoCreditProps) {
  const attr = getImageAttribution(imageKey);
  if (!attr) return null;

  if (!linked) {
    return (
      <p className={`text-[11px] text-[#77716B] leading-relaxed ${className}`}>
        <span>
          Photo: {attr.creator} · {attr.source} ({attr.license})
        </span>
      </p>
    );
  }

  return (
    <p className={`text-[11px] text-[#77716B] leading-relaxed ${className}`}>
      <span>Photo: {attr.creator} · </span>
      <a
        href={attr.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-[#941D2A] hover:underline font-medium"
      >
        <span>{attr.source}</span>
        <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      </a>
      <span> (</span>
      <a
        href={attr.licenseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-[#77716B]"
      >
        {attr.license}
      </a>
      <span>)</span>
    </p>
  );
}
