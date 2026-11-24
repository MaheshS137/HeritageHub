import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Globe, Heart, Loader2, LogOut, MapPin, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n, type SupportedLanguage } from '../i18n/I18nContext';
import { PasswordField } from '../components/auth/PasswordField';

interface FavoriteMonument {
  monument_id: string;
  monument_name: string;
  district_id: string;
  district_name: string;
  image_url: string;
  created_at: string;
}

interface FavoriteDistrict {
  district_id: string;
  district_name: string;
  region: string;
  image_url: string;
  created_at: string;
}

interface RecentView {
  id: number;
  item_type: string;
  item_id: string;
  item_title: string;
  district_id: string;
  image_url: string;
  route_path: string;
  viewed_at: string;
}

export function UserDashboardPage() {
  const { user, setAuthenticatedUser, logout, changeLanguageAndSync, toggleFavoriteMonument, toggleFavoriteDistrict } =
    useAuth();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const [favoriteMonuments, setFavoriteMonuments] = useState<FavoriteMonument[]>([]);
  const [favoriteDistricts, setFavoriteDistricts] = useState<FavoriteDistrict[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bioIntro, setBioIntro] = useState(user?.bioIntro || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadDashboard = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/user/dashboard');
      if (res.ok) {
        const data = await res.json();
        setFavoriteMonuments(data.favoriteMonuments || []);
        setFavoriteDistricts(data.favoriteDistricts || []);
        setRecentViews(data.recentViews || []);
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setBioIntro(user.bioIntro || '');
    }
    loadDashboard();
  }, [user]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, bioIntro, preferredLanguage: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileFeedback({ type: 'err', text: data.error || 'Could not update profile.' });
        return;
      }
      setAuthenticatedUser(data.user);
      setProfileFeedback({ type: 'ok', text: data.message || 'Profile saved.' });
    } catch {
      setProfileFeedback({ type: 'err', text: 'Network error while updating profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwFeedback(null);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwFeedback({ type: 'err', text: data.error || 'Failed to update password.' });
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwFeedback({ type: 'ok', text: data.message || 'Password updated.' });
    } catch {
      setPwFeedback({ type: 'err', text: 'Network error while changing password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleRemoveFavMonument = async (item: FavoriteMonument) => {
    await toggleFavoriteMonument({
      monumentId: item.monument_id,
      monumentName: item.monument_name,
      districtId: item.district_id,
      districtName: item.district_name,
      imageUrl: item.image_url,
    });
    setFavoriteMonuments((prev) => prev.filter((m) => m.monument_id !== item.monument_id));
  };

  const handleRemoveFavDistrict = async (item: FavoriteDistrict) => {
    await toggleFavoriteDistrict({
      districtId: item.district_id,
      districtName: item.district_name,
      region: item.region,
      imageUrl: item.image_url,
    });
    setFavoriteDistricts((prev) => prev.filter((d) => d.district_id !== item.district_id));
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen pb-20">
      {/* Header Band */}
      <section className="bg-[#FFFFFF] border-b border-[#EADEC8] py-10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
              {t('nav.userDashboard', 'User Dashboard')} · {user?.email}
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#292522]">
              {t('dashboard.welcome', 'Welcome back')}, {user?.fullName}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/explore"
              className="px-4 py-2 text-xs font-semibold bg-[#F8C928] text-[#201C1B] hover:bg-[#eab915] rounded-md whitespace-nowrap"
            >
              {t('nav.explore', 'Explore Karnataka')}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#EADEC8] text-[#941D2A] hover:border-[#C92332] rounded-md cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-10 space-y-12">
        {/* Saved Favourite Monuments */}
        <section>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EADEC8] mb-6">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-[#C92332]" />
              <h2 className="font-serif text-2xl text-[#292522]">
                {t('dashboard.savedMonuments', 'Saved Favourite Monuments')}
              </h2>
            </div>
            <span className="text-xs text-[#77716B] tabular-nums">{favoriteMonuments.length} saved</span>
          </div>

          {loadingData ? (
            <div className="h-32 bg-[#FBF6E8] rounded-xl animate-pulse" />
          ) : favoriteMonuments.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-8 text-center">
              <p className="text-sm text-[#77716B]">
                {t(
                  'dashboard.emptyFavorites',
                  'No favourite monuments saved yet. Explore the Karnataka map and click Save Favourite on any landmark.',
                )}
              </p>
              <Link
                to="/explore"
                className="inline-flex mt-4 px-5 py-2 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md"
              >
                {t('nav.explore', 'Explore Karnataka')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteMonuments.map((m) => (
                <article
                  key={m.monument_id}
                  className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl overflow-hidden flex flex-col"
                >
                  <img src={m.image_url} alt={m.monument_name} className="w-full h-44 object-cover" />
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#941D2A]">{m.district_name}</p>
                      <h3 className="mt-1 font-serif text-lg text-[#292522]">{m.monument_name}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#EADEC8]">
                      <Link
                        to={`/district/${m.district_id}`}
                        className="text-xs font-semibold text-[#941D2A] hover:underline"
                      >
                        {t('culture.viewDistrict', 'View District Profile')} →
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavMonument(m)}
                        className="inline-flex items-center gap-1 text-xs text-[#77716B] hover:text-[#C92332] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('dashboard.remove', 'Remove')}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Saved Districts & Recently Viewed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EADEC8] mb-4">
              <Bookmark className="w-4 h-4 text-[#C92332]" />
              <h2 className="font-serif text-xl text-[#292522]">
                {t('dashboard.savedDistricts', 'Saved Districts')}
              </h2>
            </div>
            {favoriteDistricts.length === 0 ? (
              <p className="text-sm text-[#77716B] py-4">
                {t('dashboard.emptyDistricts', 'No saved districts yet.')}
              </p>
            ) : (
              <div className="divide-y divide-[#EADEC8]">
                {favoriteDistricts.map((d) => (
                  <div key={d.district_id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={d.image_url} alt={d.district_name} className="w-11 h-11 rounded-md object-cover shrink-0" />
                      <div className="min-w-0">
                        <Link
                          to={`/district/${d.district_id}`}
                          className="font-serif text-base text-[#292522] hover:text-[#C92332] truncate block"
                        >
                          {d.district_name}
                        </Link>
                        <span className="text-xs text-[#77716B]">{d.region}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavDistrict(d)}
                      className="text-xs text-[#77716B] hover:text-[#C92332] shrink-0 cursor-pointer"
                    >
                      {t('dashboard.remove', 'Remove')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EADEC8] mb-4">
              <Clock className="w-4 h-4 text-[#C92332]" />
              <h2 className="font-serif text-xl text-[#292522]">
                {t('dashboard.recentViews', 'Recently Viewed Locations')}
              </h2>
            </div>
            {recentViews.length === 0 ? (
              <p className="text-sm text-[#77716B] py-4">
                {t('dashboard.emptyRecent', 'Your recently visited districts and monuments will appear here.')}
              </p>
            ) : (
              <div className="divide-y divide-[#EADEC8]">
                {recentViews.map((rv) => (
                  <Link
                    key={rv.id}
                    to={rv.route_path}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#FBF6E8]/60 px-2 -mx-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-[#941D2A] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#292522] truncate">{rv.item_title}</div>
                        <div className="text-[11px] text-[#77716B] capitalize">{rv.item_type}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#77716B] tabular-nums shrink-0">
                      {new Date(rv.viewed_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Profile Edit & Change Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EADEC8] mb-5">
              <UserCheck className="w-4 h-4 text-[#C92332]" />
              <h2 className="font-serif text-xl text-[#292522]">
                {t('dashboard.editProfile', 'Edit Profile')}
              </h2>
            </div>

            {profileFeedback && (
              <div
                className={`mb-4 p-3 rounded-md text-xs border ${
                  profileFeedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-[#C92332]/10 border-[#C92332]/40 text-[#941D2A]'
                }`}
              >
                {profileFeedback.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('auth.fullName', 'Full Name')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                  About / Interests
                </label>
                <textarea
                  rows={2}
                  value={bioIntro}
                  onChange={(e) => setBioIntro(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#941D2A]" />
                    {t('dashboard.languagePref', 'Preferred Language')}
                  </span>
                </label>
                <div className="flex gap-2">
                  {(['en', 'kn', 'hi'] as SupportedLanguage[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => changeLanguageAndSync(code)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-md border cursor-pointer ${
                        lang === code
                          ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                          : 'bg-[#FBF6E8] text-[#292522] border-[#EADEC8]'
                      }`}
                    >
                      {code === 'en' ? 'English' : code === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
              >
                {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('dashboard.saveChanges', 'Save Changes')}</span>
              </button>
            </form>
          </section>

          <section className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6">
            <h2 className="font-serif text-xl text-[#292522] pb-3 border-b border-[#EADEC8] mb-5">
              {t('dashboard.changePassword', 'Change Password')}
            </h2>

            {pwFeedback && (
              <div
                className={`mb-4 p-3 rounded-md text-xs border ${
                  pwFeedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-[#C92332]/10 border-[#C92332]/40 text-[#941D2A]'
                }`}
              >
                {pwFeedback.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <PasswordField
                id="user-cur-pw"
                label={t('dashboard.currentPassword', 'Current Password')}
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <PasswordField
                id="user-new-pw"
                label={t('recovery.newPassword', 'New Password')}
                value={newPassword}
                onChange={setNewPassword}
                showStrength
                autoComplete="new-password"
              />
              <PasswordField
                id="user-conf-pw"
                label={t('auth.confirmPassword', 'Confirm Password')}
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#201C1B] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
              >
                {pwSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('dashboard.changePassword', 'Change Password')}</span>
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
