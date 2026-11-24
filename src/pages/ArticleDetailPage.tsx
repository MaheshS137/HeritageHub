import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Globe, MapPin, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { resolveHeritageImage } from '../data/imageAssets';
import { HeritageImage } from '../components/HeritageImage';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';

interface PublishedArticle {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  district_id: string;
  district_name: string;
  category_slug: string;
  category_title: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { recordRecentView } = useAuth();
  const { lang, t } = useI18n();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [article, setArticle] = useState<PublishedArticle | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setStatus('loading');
    fetch(`/api/heritage/articles/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const art = data.article as PublishedArticle;
        setArticle(art);
        setStatus('ready');
        recordRecentView({
          itemType: 'article',
          itemId: art.id,
          itemTitle: art.title,
          districtId: art.district_id,
          imageUrl: art.cover_image_url,
          routePath: `/article/${art.slug}`,
        });
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [slug, recordRecentView]);

  if (status === 'loading') {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8" aria-busy="true">
        <div className="max-w-[960px] mx-auto space-y-6">
          <div className="h-10 w-2/3 bg-[#EADEC8] animate-pulse rounded-md" />
          <div className="h-80 bg-[#EADEC8] animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'error' || !article) {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8">
        <UnavailableNotice
          title="Published Feature Unavailable"
          message="The requested heritage article could not be found or is awaiting editorial approval."
        />
        <div className="mt-6 text-center">
          <Link
            to="/culture"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Cultural Heritage</span>
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <article className="bg-[#FFFDF7] min-h-screen">
      <header className="border-b border-[#EADEC8] bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[960px] mx-auto px-5 sm:px-8">
          <Link
            to="/culture"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#941D2A] hover:text-[#C92332] mb-6"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Cultural Heritage</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#941D2A]">
            <span>{article.category_title || article.category_slug}</span>
            <span>·</span>
            <Link to={`/district/${article.district_id}`} className="hover:underline">
              {article.district_name} District
            </Link>
          </div>

          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-medium text-[#292522] leading-[1.12]">
            {article.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#77716B] leading-relaxed">
            {article.short_description}
          </p>

          <div className="mt-6 pt-5 border-t border-[#EADEC8] flex flex-wrap items-center gap-6 text-xs text-[#77716B]">
            <span className="inline-flex items-center gap-1.5 text-[#292522] font-medium">
              <PenTool className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
              <span>By {article.author_name}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
              <span>{article.district_name}</span>
            </span>
            {publishedDate && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                <span>{publishedDate}</span>
              </span>
            )}
          </div>

          {lang !== 'en' && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#EADEC8] bg-[#FBF6E8] px-3.5 py-2 text-xs font-medium text-[#941D2A]">
              <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('culture.englishFallbackNote')}</span>
            </div>
          )}
        </div>
      </header>

      <section className="py-12 lg:py-16">
        <div className="max-w-[960px] mx-auto px-5 sm:px-8 space-y-10">
          {article.cover_image_url && (
            <HeritageImage
              src={resolveHeritageImage(article.cover_image_url)}
              alt={article.title}
              priority
              containerClassName="aspect-[16/9] w-full rounded-xl border border-[#EADEC8] shadow-sm"
            />
          )}

          <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-7 sm:p-10 space-y-5 text-base text-[#292522] leading-[1.85] whitespace-pre-line">
            {article.content}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <Link
              to={`/district/${article.district_id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md"
            >
              <span>Explore {article.district_name} District</span>
            </Link>
            <Link
              to="/culture"
              className="text-xs font-semibold text-[#941D2A] hover:underline"
            >
              Browse All Cultural Records →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
