import { useEffect, useRef, useState } from 'react';
import { Landmark } from 'lucide-react';

interface HeritageImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  zoomOnHover?: boolean;
  priority?: boolean;
}

export function HeritageImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  zoomOnHover = false,
  priority = false,
}: HeritageImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#FBF6E8] border border-[#EADEC8] text-[#941D2A] px-6 py-8 text-center ${containerClassName}`}
      >
        <div className="w-12 h-12 rounded-full bg-[#C92332] text-[#F8C928] flex items-center justify-center mb-3 shadow-xs">
          <Landmark className="w-6 h-6" strokeWidth={1.6} aria-hidden="true" />
        </div>
        <span className="font-serif text-sm font-medium text-[#292522] max-w-[26ch]">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#FBF6E8] ${containerClassName}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.015]'
        } ${zoomOnHover ? 'group-hover:scale-[1.04]' : ''} ${className}`}
      />
    </div>
  );
}
