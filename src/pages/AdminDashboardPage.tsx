import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Landmark,
  Loader2,
  LogOut,
  Plus,
  Search,
  ShieldPlus,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { useAuth, type AuthAccount } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useDistrictArchive } from '../hooks/useDistrictArchive';
import { PasswordField } from '../components/auth/PasswordField';

interface AdminStats {
  totalUsers: number;
  totalJournalists: number;
  totalDistricts: number;
  totalMonuments: number;
  pendingArticles: number;
  publishedArticles: number;
}

interface AdminArticle {
  id: string;
  title: string;
  short_description: string;
  content: string;
  district_name: string;
  category_slug: string;
  cover_image_url: string;
  author_name: string;
  status: string;
  admin_feedback: string;
  submitted_at: string | null;
}

interface AdminMonument {
  id: string;
  district_id: string;
  district_name: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  image_url: string;
  description: string;
  cultural_significance: string;
}

type AdminTab = 'articles' | 'users' | 'monuments' | 'categories';

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { districts, categories, records, retry: reloadArchive } = useDistrictArchive();

  const [tab, setTab] = useState<AdminTab>('articles');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [monuments, setMonuments] = useState<AdminMonument[]>([]);

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState<AuthAccount | null>(null);

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Add/Edit Monument Form
  const [editMonId, setEditMonId] = useState<string | null>(null);
  const [monDistrictId, setMonDistrictId] = useState('mysuru');
  const [monName, setMonName] = useState('');
  const [monLocation, setMonLocation] = useState('');
  const [monLat, setMonLat] = useState('12.3052');
  const [monLng, setMonLng] = useState('76.6552');
  const [monImageUrl, setMonImageUrl] = useState('/images/mysore-palace.jpg');
  const [monDesc, setMonDesc] = useState('');
  const [monSignificance, setMonSignificance] = useState('');

  // Edit District Form
  const [editDistId, setEditDistId] = useState('mysuru');
  const [distDesc, setDistDesc] = useState('');
  const [distFestivals, setDistFestivals] = useState('');
  const [distTraditions, setDistTraditions] = useState('');

  // Create New Admin Form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPw, setNewAdminPw] = useState('');
  const [newAdminConf, setNewAdminConf] = useState('');
  const [newAdminQ, setNewAdminQ] = useState('What was the name of your first school?');
  const [newAdminA, setNewAdminA] = useState('');

  // Category / Cultural Record Form
  const [catTitle, setCatTitle] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [recTitle, setRecTitle] = useState('');
  const [recDistrict, setRecDistrict] = useState('Mysuru');
  const [recCatSlug, setRecCatSlug] = useState('festivals-celebrations');
  const [recSummary, setRecSummary] = useState('');

  const loadAll = async () => {
    const [sRes, aRes, uRes, mRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/articles'),
      fetch(`/api/admin/users?role=${encodeURIComponent(roleFilter)}&q=${encodeURIComponent(userSearch)}`),
      fetch('/api/admin/monuments'),
    ]);
    if (sRes.ok) setStats(await sRes.json());
    if (aRes.ok) setArticles((await aRes.json()).articles || []);
    if (uRes.ok) setAccounts((await uRes.json()).users || []);
    if (mRes.ok) setMonuments((await mRes.json()).monuments || []);
  };

  useEffect(() => {
    loadAll();
  }, [roleFilter]);

  useEffect(() => {
    const d = districts.find((x) => x.id === editDistId);
    if (d) {
      setDistDesc(d.description || '');
      setDistFestivals((d.festivals || []).join('\n'));
      setDistTraditions((d.traditions || []).join('\n'));
    }
  }, [editDistId, districts]);

  const handleSearchUsers = (e: FormEvent) => {
    e.preventDefault();
    loadAll();
  };

  const handleToggleAccountStatus = async (acc: AuthAccount) => {
    const res = await fetch(`/api/admin/users/${acc.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !acc.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Could not update account status.' });
      return;
    }
    setBanner({ type: 'ok', text: data.message });
    loadAll();
  };

  const handleCreateAdmin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: newAdminName,
        email: newAdminEmail,
        password: newAdminPw,
        confirmPassword: newAdminConf,
        securityQuestion: newAdminQ,
        securityAnswer: newAdminA,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Failed to create admin account.' });
      return;
    }
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPw('');
    setNewAdminConf('');
    setNewAdminA('');
    setBanner({ type: 'ok', text: data.message });
    loadAll();
  };

  const handleArticleAction = async (id: string, action: 'approve' | 'publish' | 'reject', feedbackText = '') => {
    const res = await fetch(`/api/admin/articles/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: feedbackText }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Action failed.' });
      return;
    }
    setRejectId(null);
    setRejectNote('');
    setBanner({ type: 'ok', text: `Article ${action}ed successfully.` });
    loadAll();
  };

  const handleMonumentPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setMonImageUrl(data.url);
      setBanner({ type: 'ok', text: 'Monument photograph uploaded.' });
    } else {
      setBanner({ type: 'err', text: data.error || 'Upload failed.' });
    }
  };

  const handleSaveMonument = async (e: FormEvent) => {
    e.preventDefault();
    const url = editMonId ? `/api/admin/monuments/${editMonId}` : '/api/admin/monuments';
    const method = editMonId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        districtId: monDistrictId,
        name: monName,
        location: monLocation,
        lat: Number(monLat),
        lng: Number(monLng),
        imageUrl: monImageUrl,
        description: monDesc,
        culturalSignificance: monSignificance,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Could not save monument.' });
      return;
    }
    setEditMonId(null);
    setMonName('');
    setMonLocation('');
    setMonDesc('');
    setMonSignificance('');
    setBanner({ type: 'ok', text: editMonId ? 'Monument updated.' : 'Monument added.' });
    loadAll();
  };

  const handleDeleteMonument = async (id: string) => {
    const res = await fetch(`/api/admin/monuments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBanner({ type: 'ok', text: 'Monument removed.' });
      loadAll();
    }
  };

  const handleSaveDistrict = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/districts/${editDistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: distDesc,
        festivals: distFestivals,
        traditions: distTraditions,
      }),
    });
    if (res.ok) {
      setBanner({ type: 'ok', text: 'District cultural details saved.' });
      reloadArchive();
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: catTitle, subtitle: catSubtitle, description: catDesc }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Could not add category.' });
      return;
    }
    setCatTitle('');
    setCatSubtitle('');
    setCatDesc('');
    setBanner({ type: 'ok', text: 'Heritage category created.' });
    reloadArchive();
  };

  const handleAddCulturalRecord = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/cultural-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: recTitle,
        district: recDistrict,
        categorySlug: recCatSlug,
        summary: recSummary,
        description: recSummary,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner({ type: 'err', text: data.error || 'Could not add cultural record.' });
      return;
    }
    setRecTitle('');
    setRecSummary('');
    setBanner({ type: 'ok', text: 'Festival/cultural record published to catalog.' });
    reloadArchive();
  };

  const handleDeleteRecord = async (id: string) => {
    const res = await fetch(`/api/admin/cultural-records/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBanner({ type: 'ok', text: 'Cultural record deleted.' });
      reloadArchive();
    }
  };

  const statItems = [
    { label: t('dashboard.admin.statsUsers', 'Total Users'), value: stats?.totalUsers ?? 0 },
    { label: t('dashboard.admin.statsJournalists', 'Total Journalists'), value: stats?.totalJournalists ?? 0 },
    { label: t('dashboard.admin.statsDistricts', 'Total Districts'), value: stats?.totalDistricts ?? 31 },
    { label: t('dashboard.admin.statsMonuments', 'Total Monuments'), value: stats?.totalMonuments ?? 0 },
    { label: t('dashboard.admin.statsPending', 'Pending Articles'), value: stats?.pendingArticles ?? 0 },
    { label: t('dashboard.admin.statsPublished', 'Published Articles'), value: stats?.publishedArticles ?? 0 },
  ];

  return (
    <div className="bg-[#FFFDF7] min-h-screen pb-20">
      <section className="bg-[#FFFFFF] border-b border-[#EADEC8] py-10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
              {t('nav.adminDashboard', 'Admin Console')} · {user?.email}
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#292522]">{user?.fullName}</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/auth');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#EADEC8] text-[#941D2A] rounded-md cursor-pointer self-start md:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.logout', 'Sign Out')}</span>
          </button>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-8 space-y-8">
        {/* Live Tabular KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((s) => (
            <div key={s.label} className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-4">
              <div className="font-serif text-2xl sm:text-3xl text-[#C92332] tabular-nums">{s.value}</div>
              <div className="mt-1 text-xs text-[#77716B]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#EADEC8] pb-3">
          {(
            [
              ['articles', t('dashboard.admin.tabArticles', 'Article Review')],
              ['users', t('dashboard.admin.tabUsers', 'Users & Journalists')],
              ['monuments', t('dashboard.admin.tabMonuments', 'Monuments & Districts')],
              ['categories', t('dashboard.admin.tabCategories', 'Categories & Records')],
            ] as [AdminTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                tab === key ? 'bg-[#C92332] text-[#FFFFFF]' : 'bg-[#FBF6E8] text-[#292522] hover:bg-[#F8C928]/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {banner && (
          <div
            className={`p-3.5 rounded-md border flex items-center gap-2 text-xs sm:text-sm ${
              banner.type === 'ok'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-[#C92332]/10 border-[#C92332]/40 text-[#941D2A]'
            }`}
          >
            {banner.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{banner.text}</span>
          </div>
        )}

        {/* TAB 1: Article Review */}
        {tab === 'articles' && (
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-10 text-center text-sm text-[#77716B]">
                No journalist articles submitted yet.
              </div>
            ) : (
              articles.map((art) => (
                <article
                  key={art.id}
                  className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-5 flex flex-col lg:flex-row gap-6"
                >
                  <img
                    src={art.cover_image_url}
                    alt={art.title}
                    className="w-full lg:w-56 h-40 object-cover rounded-lg border border-[#EADEC8] shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#77716B]">
                      <span className="font-semibold text-[#941D2A]">{art.status}</span>
                      <span aria-hidden="true">·</span>
                      <span>{art.district_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>By {art.author_name}</span>
                    </div>
                    <h3 className="font-serif text-xl text-[#292522]">{art.title}</h3>
                    <p className="text-sm text-[#77716B]">{art.short_description}</p>
                    <p className="text-xs text-[#292522] line-clamp-3">{art.content}</p>

                    <div className="pt-3 flex flex-wrap items-center gap-2.5">
                      {art.status !== 'PUBLISHED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleArticleAction(art.id, 'approve')}
                            className="px-3.5 py-2 text-xs font-semibold bg-[#F8C928] text-[#201C1B] rounded-md cursor-pointer"
                          >
                            {t('dashboard.admin.approve', 'Approve')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArticleAction(art.id, 'publish')}
                            className="px-3.5 py-2 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                          >
                            {t('dashboard.admin.publish', 'Publish')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectId(art.id);
                              setRejectNote(art.admin_feedback || '');
                            }}
                            className="px-3.5 py-2 text-xs font-semibold border border-[#C92332] text-[#941D2A] rounded-md cursor-pointer"
                          >
                            {t('dashboard.admin.reject', 'Reject with Feedback')}
                          </button>
                        </>
                      )}
                    </div>

                    {rejectId === art.id && (
                      <div className="mt-3 p-4 bg-[#FBF6E8] border border-[#EADEC8] rounded-md space-y-2">
                        <textarea
                          rows={2}
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Provide required revisions or verification feedback..."
                          className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#EADEC8] rounded-md"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleArticleAction(art.id, 'reject', rejectNote)}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectId(null)}
                            className="px-3.5 py-1.5 text-xs text-[#77716B] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Users, Journalists & Controlled Admin Creation */}
        {tab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl text-[#292522] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#941D2A]" />
                  <span>{t('dashboard.admin.tabUsers', 'Users & Journalists')}</span>
                </h2>
                <form onSubmit={handleSearchUsers} className="flex gap-2">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="px-3 py-1.5 text-xs border border-[#EADEC8] rounded-md"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-[#EADEC8] rounded-md"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">USER</option>
                    <option value="JOURNALIST">JOURNALIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EADEC8] text-[#77716B]">
                      <th className="py-2.5 pr-3">Name</th>
                      <th className="py-2.5 pr-3">Email</th>
                      <th className="py-2.5 pr-3">Role</th>
                      <th className="py-2.5 pr-3">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADEC8]">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-[#FBF6E8]/60">
                        <td className="py-3 pr-3 font-medium text-[#292522]">{acc.fullName}</td>
                        <td className="py-3 pr-3 text-[#77716B]">{acc.email}</td>
                        <td className="py-3 pr-3 font-semibold text-[#941D2A]">{acc.role}</td>
                        <td className="py-3 pr-3">{acc.active ? 'Active' : 'Deactivated'}</td>
                        <td className="py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedAccount(acc)}
                            className="text-[#941D2A] hover:underline cursor-pointer"
                          >
                            Details
                          </button>
                          {acc.id !== user?.id && (
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(acc)}
                              className="px-2.5 py-1 border border-[#EADEC8] rounded text-[11px] font-semibold cursor-pointer"
                            >
                              {acc.active
                                ? t('dashboard.admin.deactivate', 'Deactivate')
                                : t('dashboard.admin.activate', 'Activate')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedAccount && (
                <div className="p-4 bg-[#FBF6E8] border border-[#EADEC8] rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-sm font-serif text-[#292522]">{selectedAccount.fullName}</strong>
                    <button
                      type="button"
                      onClick={() => setSelectedAccount(null)}
                      className="text-[#941D2A] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-[#77716B]">
                    {selectedAccount.email} · {selectedAccount.role} · Language: {selectedAccount.preferredLanguage}
                  </p>
                  {selectedAccount.bioIntro && <p className="text-[#292522] pt-1">{selectedAccount.bioIntro}</p>}
                </div>
              )}
            </div>

            {/* Controlled Admin Creation */}
            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
              <h3 className="font-serif text-xl text-[#292522] flex items-center gap-2 pb-3 border-b border-[#EADEC8] mb-4">
                <ShieldPlus className="w-5 h-5 text-[#C92332]" />
                <span>{t('dashboard.admin.createAdmin', 'Create Admin Account')}</span>
              </h3>
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Administrator Full Name"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <PasswordField
                  id="admin-new-pw"
                  label="Password"
                  value={newAdminPw}
                  onChange={setNewAdminPw}
                  showStrength
                />
                <PasswordField
                  id="admin-conf-pw"
                  label="Confirm Password"
                  value={newAdminConf}
                  onChange={setNewAdminConf}
                />
                <input
                  type="text"
                  required
                  value={newAdminQ}
                  onChange={(e) => setNewAdminQ(e.target.value)}
                  placeholder="Security Question"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <input
                  type="text"
                  required
                  value={newAdminA}
                  onChange={(e) => setNewAdminA(e.target.value)}
                  placeholder="Security Answer"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
                >
                  {t('dashboard.admin.createAdmin', 'Create Admin Account')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Monuments & District Management */}
        {tab === 'monuments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleSaveMonument} className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-3">
                <h2 className="font-serif text-xl text-[#292522] flex items-center gap-2 pb-3 border-b border-[#EADEC8]">
                  <Landmark className="w-5 h-5 text-[#C92332]" />
                  <span>{editMonId ? 'Edit Monument' : t('dashboard.admin.addMonument', 'Add Monument')}</span>
                </h2>
                <select
                  value={monDistrictId}
                  onChange={(e) => setMonDistrictId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={monName}
                  onChange={(e) => setMonName(e.target.value)}
                  placeholder="Monument Name"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <input
                  type="text"
                  required
                  value={monLocation}
                  onChange={(e) => setMonLocation(e.target.value)}
                  placeholder="Location / Town"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={monLat}
                    onChange={(e) => setMonLat(e.target.value)}
                    placeholder="Latitude"
                    className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={monLng}
                    onChange={(e) => setMonLng(e.target.value)}
                    placeholder="Longitude"
                    className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#FBF6E8] border border-[#EADEC8] rounded-md cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleMonumentPhotoUpload} className="sr-only" />
                  </label>
                  <input
                    type="text"
                    value={monImageUrl}
                    onChange={(e) => setMonImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={monDesc}
                  onChange={(e) => setMonDesc(e.target.value)}
                  placeholder="Historical description..."
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <textarea
                  rows={2}
                  value={monSignificance}
                  onChange={(e) => setMonSignificance(e.target.value)}
                  placeholder="Cultural significance..."
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                  >
                    {editMonId ? 'Update Monument' : 'Save Monument'}
                  </button>
                  {editMonId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditMonId(null);
                        setMonName('');
                        setMonDesc('');
                      }}
                      className="px-3 py-2 text-xs text-[#77716B] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Edit District Metadata */}
              <form onSubmit={handleSaveDistrict} className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-3">
                <h3 className="font-serif text-lg text-[#292522] pb-2 border-b border-[#EADEC8]">
                  Manage District Details
                </h3>
                <select
                  value={editDistId}
                  onChange={(e) => setEditDistId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  value={distDesc}
                  onChange={(e) => setDistDesc(e.target.value)}
                  placeholder="District overview"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <textarea
                  rows={2}
                  value={distFestivals}
                  onChange={(e) => setDistFestivals(e.target.value)}
                  placeholder="Festivals (one per line)"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <textarea
                  rows={2}
                  value={distTraditions}
                  onChange={(e) => setDistTraditions(e.target.value)}
                  placeholder="Traditions (one per line)"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#F8C928] text-[#201C1B] rounded-md cursor-pointer"
                >
                  Save District Information
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
              <h3 className="font-serif text-xl text-[#292522] pb-3 border-b border-[#EADEC8] mb-4">
                Monument Records ({monuments.length})
              </h3>
              <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
                {monuments.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 border border-[#EADEC8] rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={m.image_url} alt={m.name} className="w-16 h-12 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-serif text-[#292522] truncate">{m.name}</div>
                        <div className="text-xs text-[#77716B] truncate">
                          {m.district_name} · {m.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMonId(m.id);
                          setMonDistrictId(m.district_id);
                          setMonName(m.name);
                          setMonLocation(m.location);
                          setMonLat(String(m.lat));
                          setMonLng(String(m.lng));
                          setMonImageUrl(m.image_url);
                          setMonDesc(m.description);
                          setMonSignificance(m.cultural_significance);
                        }}
                        className="px-2.5 py-1 text-xs border border-[#EADEC8] rounded cursor-pointer"
                      >
                        {t('dashboard.admin.edit', 'Edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMonument(m.id)}
                        className="p-1.5 text-[#C92332] hover:bg-[#C92332]/10 rounded cursor-pointer"
                        aria-label={`Delete ${m.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Categories & Festivals / Cultural Traditions */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-5">
              <h2 className="font-serif text-xl text-[#292522] pb-3 border-b border-[#EADEC8]">
                Heritage Categories ({categories.length})
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <input
                  type="text"
                  required
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="New Category Title"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <input
                  type="text"
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="Category Subtitle"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <textarea
                  rows={2}
                  required
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category Description"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </form>

              <div className="divide-y divide-[#EADEC8] pt-2">
                {categories.map((c) => (
                  <div key={c.slug} className="py-2.5 text-xs">
                    <div className="font-semibold text-[#292522]">
                      {c.indexNumber}. {c.title}
                    </div>
                    <div className="text-[#77716B]">{c.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-5">
              <h2 className="font-serif text-xl text-[#292522] pb-3 border-b border-[#EADEC8]">
                Festivals & Cultural Traditions ({records.length})
              </h2>
              <form onSubmit={handleAddCulturalRecord} className="space-y-3">
                <input
                  type="text"
                  required
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="Festival / Cultural Tradition Title"
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={recDistrict}
                    onChange={(e) => setRecDistrict(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={recCatSlug}
                    onChange={(e) => setRecCatSlug(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  required
                  value={recSummary}
                  onChange={(e) => setRecSummary(e.target.value)}
                  placeholder="Verified cultural summary..."
                  className="w-full px-3 py-2 text-xs border border-[#EADEC8] rounded-md"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F8C928] text-[#201C1B] rounded-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cultural Tradition</span>
                </button>
              </form>

              <div className="divide-y divide-[#EADEC8] max-h-[380px] overflow-y-auto">
                {records.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-[#292522]">{r.title}</div>
                      <div className="text-[#77716B]">
                        {r.district} · {r.categorySlug}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(r.id)}
                      className="text-[#C92332] hover:underline shrink-0 cursor-pointer"
                    >
                      {t('dashboard.admin.delete', 'Delete')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
