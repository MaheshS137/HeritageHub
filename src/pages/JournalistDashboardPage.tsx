import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Edit3, FileText, Loader2, LogOut, Send, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useDistrictArchive } from '../hooks/useDistrictArchive';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  district_id: string;
  district_name: string;
  category_slug: string;
  cover_image_url: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  admin_feedback: string;
  submitted_at: string | null;
  published_at: string | null;
  updated_at: string;
}

export function JournalistDashboardPage() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { districts, categories } = useDistrictArchive();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'compose'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [districtId, setDistrictId] = useState('mysuru');
  const [categorySlug, setCategorySlug] = useState('historical-monuments');
  const [coverImageUrl, setCoverImageUrl] = useState('/images/hero-hampi.jpg');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journalist/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setShortDescription('');
    setContent('');
    setDistrictId(districts[0]?.id || 'mysuru');
    setCategorySlug(categories[0]?.slug || 'historical-monuments');
    setCoverImageUrl('/images/hero-hampi.jpg');
  };

  const handleEditArticle = (art: ArticleItem) => {
    setEditingId(art.id);
    setTitle(art.title);
    setShortDescription(art.short_description);
    setContent(art.content);
    setDistrictId(art.district_id);
    setCategorySlug(art.category_slug);
    setCoverImageUrl(art.cover_image_url);
    setFeedback(null);
    setActiveTab('compose');
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/journalist/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Upload failed.' });
        return;
      }
      setCoverImageUrl(data.url);
      setFeedback({ type: 'ok', text: 'Photograph uploaded cleanly.' });
    } catch {
      setFeedback({ type: 'err', text: 'Failed to upload photograph.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveOrSubmit = async (targetStatus: 'DRAFT' | 'PENDING_REVIEW', e?: FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const url = editingId ? `/api/journalist/articles/${editingId}` : '/api/journalist/articles';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          shortDescription,
          content,
          districtId,
          categorySlug,
          coverImageUrl,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Could not save article.' });
        return;
      }
      setFeedback({
        type: 'ok',
        text:
          targetStatus === 'PENDING_REVIEW'
            ? 'Article submitted for administrator review.'
            : 'Article saved to drafts.',
      });
      resetForm();
      await loadArticles();
      setActiveTab('list');
    } catch {
      setFeedback({ type: 'err', text: 'Network error while saving article.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSubmit = async (id: string) => {
    const res = await fetch(`/api/journalist/articles/${id}/submit`, { method: 'POST' });
    if (res.ok) {
      setFeedback({ type: 'ok', text: 'Article submitted for administrator review.' });
      await loadArticles();
    }
  };

  const statusText = (s: ArticleItem['status']) => {
    if (s === 'DRAFT') return t('dashboard.journalist.statusDraft', 'Draft');
    if (s === 'PENDING_REVIEW') return t('dashboard.journalist.statusPending', 'Pending Review');
    if (s === 'APPROVED') return t('dashboard.journalist.statusApproved', 'Approved');
    if (s === 'REJECTED') return t('dashboard.journalist.statusRejected', 'Rejected');
    return t('dashboard.journalist.statusPublished', 'Published');
  };

  const statusTone = (s: ArticleItem['status']) => {
    if (s === 'PUBLISHED') return 'text-emerald-800';
    if (s === 'APPROVED') return 'text-[#941D2A]';
    if (s === 'REJECTED') return 'text-[#C92332]';
    if (s === 'PENDING_REVIEW') return 'text-amber-800';
    return 'text-[#77716B]';
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen pb-20">
      <section className="bg-[#FFFFFF] border-b border-[#EADEC8] py-10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
              {t('nav.journalistDashboard', 'Journalist Studio')} · {user?.email}
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#292522]">{user?.fullName}</h1>
            {user?.bioIntro && <p className="mt-2 text-sm text-[#77716B] max-w-2xl">{user.bioIntro}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('compose');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
            >
              + {t('dashboard.journalist.writeArticle', 'Write New Article')}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/auth');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#EADEC8] text-[#941D2A] rounded-md cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#EADEC8] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              activeTab === 'list' ? 'bg-[#C92332] text-[#FFFFFF]' : 'bg-[#FBF6E8] text-[#292522]'
            }`}
          >
            {t('dashboard.journalist.myArticles', 'My Articles')} ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-xs font-semibold rounded-md cursor-pointer ${
              activeTab === 'compose' ? 'bg-[#C92332] text-[#FFFFFF]' : 'bg-[#FBF6E8] text-[#292522]'
            }`}
          >
            {editingId ? 'Edit Article' : t('dashboard.journalist.writeArticle', 'Write New Article')}
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-6 p-3.5 rounded-md border flex items-center gap-2 text-xs sm:text-sm ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-[#C92332]/10 border-[#C92332]/40 text-[#941D2A]'
            }`}
          >
            {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="h-40 bg-[#FBF6E8] rounded-xl animate-pulse" />
            ) : articles.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-10 text-center">
                <FileText className="w-9 h-9 text-[#941D2A] mx-auto mb-3" />
                <h2 className="font-serif text-xl text-[#292522]">No Articles Created Yet</h2>
                <p className="mt-1 text-sm text-[#77716B]">
                  Start documenting Karnataka&apos;s cultural traditions and submit them for editorial review.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="mt-5 px-5 py-2.5 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                >
                  {t('dashboard.journalist.writeArticle', 'Write New Article')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((art) => (
                  <article
                    key={art.id}
                    className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl overflow-hidden flex flex-col"
                  >
                    <img src={art.cover_image_url} alt={art.title} className="w-full h-44 object-cover" />
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-semibold ${statusTone(art.status)}`}>{statusText(art.status)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#77716B]">{art.district_name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#77716B] tabular-nums">
                            {new Date(art.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="mt-2 font-serif text-xl text-[#292522]">{art.title}</h3>
                        <p className="mt-1.5 text-xs text-[#77716B] line-clamp-2">{art.short_description}</p>

                        {art.admin_feedback && (
                          <div className="mt-3 p-3 bg-[#FBF6E8] border border-[#EADEC8] rounded-md text-xs text-[#292522]">
                            <span className="font-semibold text-[#941D2A]">
                              {t('dashboard.journalist.adminFeedback', 'Administrator Feedback')}:{' '}
                            </span>
                            {art.admin_feedback}
                          </div>
                        )}
                      </div>

                      {(art.status === 'DRAFT' || art.status === 'REJECTED') && (
                        <div className="pt-3 border-t border-[#EADEC8] flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditArticle(art)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#EADEC8] hover:border-[#C92332] text-[#292522] rounded-md cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {art.status === 'REJECTED'
                                ? t('dashboard.journalist.resubmit', 'Edit & Resubmit')
                                : t('dashboard.admin.edit', 'Edit')}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickSubmit(art.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t('dashboard.journalist.submitReview', 'Submit for Admin Review')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compose' && (
          <form
            onSubmit={(e) => handleSaveOrSubmit('PENDING_REVIEW', e)}
            className="max-w-3xl bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-serif text-2xl text-[#292522] pb-3 border-b border-[#EADEC8]">
              {editingId ? 'Edit Cultural Article' : t('dashboard.journalist.writeArticle', 'Write New Article')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                {t('dashboard.journalist.articleTitle', 'Article Title')}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Keladi Nayaka Woodcarving Traditions of Shivamogga"
                className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('dashboard.journalist.district', 'Karnataka District')}
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('dashboard.journalist.category', 'Cultural Category')}
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                {t('dashboard.journalist.shortDesc', 'Short Description')}
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise two-sentence summary for editorial cards..."
                className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                {t('dashboard.journalist.content', 'Full Article Content')}
              </label>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write verified historical context, regional traditions, and source references..."
                className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
              />
            </div>

            <div className="p-4 bg-[#FBF6E8] border border-[#EADEC8] rounded-lg space-y-3">
              <label className="block text-xs font-semibold text-[#292522]">
                {t('dashboard.journalist.coverPhoto', 'Cover Photograph')}
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-32 h-20 object-cover rounded-md border border-[#EADEC8]"
                />
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-md cursor-pointer">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Photo (JPG / PNG / WEBP)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="block w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#EADEC8] rounded-md"
                    placeholder="/images/hero-hampi.jpg"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#77716B]">
              Note: Submitted articles enter <strong>Pending Review</strong>. Only platform administrators can approve or publish articles.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveOrSubmit('DRAFT')}
                className="px-5 py-2.5 text-xs font-semibold border border-[#EADEC8] hover:border-[#292522] text-[#292522] rounded-md cursor-pointer"
              >
                {t('dashboard.journalist.saveDraft', 'Save Draft')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('dashboard.journalist.submitReview', 'Submit for Admin Review')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
