import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useI18n, type SupportedLanguage } from '../i18n/I18nContext';

export type AccountRole = 'USER' | 'JOURNALIST' | 'ADMIN';

export interface AuthAccount {
  id: string;
  fullName: string;
  email: string;
  role: AccountRole;
  bioIntro: string;
  preferredLanguage: SupportedLanguage;
  active: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthAccount | null;
  loading: boolean;
  needsInitialAdmin: boolean;
  favoriteMonumentIds: Set<string>;
  favoriteDistrictIds: Set<string>;
  refreshAuth: () => Promise<void>;
  setAuthenticatedUser: (account: AuthAccount | null) => void;
  logout: () => Promise<void>;
  changeLanguageAndSync: (nextLang: SupportedLanguage) => Promise<void>;
  toggleFavoriteMonument: (payload: {
    monumentId: string;
    monumentName: string;
    districtId: string;
    districtName: string;
    imageUrl: string;
  }) => Promise<boolean>;
  toggleFavoriteDistrict: (payload: {
    districtId: string;
    districtName: string;
    region: string;
    imageUrl: string;
  }) => Promise<boolean>;
  recordRecentView: (payload: {
    itemType: 'monument' | 'district' | 'culture' | 'article';
    itemId: string;
    itemTitle: string;
    districtId?: string;
    imageUrl?: string;
    routePath: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setLang } = useI18n();
  const [user, setUser] = useState<AuthAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsInitialAdmin, setNeedsInitialAdmin] = useState(false);
  const [favoriteMonumentIds, setFavoriteMonumentIds] = useState<Set<string>>(new Set());
  const [favoriteDistrictIds, setFavoriteDistrictIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      if (!res.ok) return;
      const data = await res.json();
      setFavoriteMonumentIds(
        new Set((data.favoriteMonuments || []).map((m: { monument_id: string }) => m.monument_id)),
      );
      setFavoriteDistrictIds(
        new Set((data.favoriteDistricts || []).map((d: { district_id: string }) => d.district_id)),
      );
    } catch {
      // ignore
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, setupRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/auth/setup-status'),
      ]);
      const meData = await meRes.json();
      const setupData = await setupRes.json();
      setNeedsInitialAdmin(Boolean(setupData.needsInitialAdmin));

      if (meData.authenticated && meData.user) {
        const account = meData.user as AuthAccount;
        setUser(account);
        if (account.preferredLanguage) {
          setLang(account.preferredLanguage);
        }
        await loadFavorites();
      } else {
        setUser(null);
        setFavoriteMonumentIds(new Set());
        setFavoriteDistrictIds(new Set());
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites, setLang]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const setAuthenticatedUser = useCallback(
    (account: AuthAccount | null) => {
      setUser(account);
      if (account) {
        if (account.preferredLanguage) setLang(account.preferredLanguage);
        loadFavorites();
        fetch('/api/auth/setup-status')
          .then((r) => r.json())
          .then((d) => setNeedsInitialAdmin(Boolean(d.needsInitialAdmin)))
          .catch(() => undefined);
      } else {
        setFavoriteMonumentIds(new Set());
        setFavoriteDistrictIds(new Set());
      }
    },
    [loadFavorites, setLang],
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setFavoriteMonumentIds(new Set());
    setFavoriteDistrictIds(new Set());
  }, []);

  const changeLanguageAndSync = useCallback(
    async (nextLang: SupportedLanguage) => {
      setLang(nextLang);
      if (user) {
        setUser((prev) => (prev ? { ...prev, preferredLanguage: nextLang } : prev));
        await fetch('/api/user/language', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: nextLang }),
        }).catch(() => undefined);
      }
    },
    [setLang, user],
  );

  const toggleFavoriteMonument = useCallback(
    async (payload: {
      monumentId: string;
      monumentName: string;
      districtId: string;
      districtName: string;
      imageUrl: string;
    }): Promise<boolean> => {
      if (!user) return false;
      const isFav = favoriteMonumentIds.has(payload.monumentId);
      if (isFav) {
        const res = await fetch(`/api/user/favorites/monuments/${encodeURIComponent(payload.monumentId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFavoriteMonumentIds((prev) => {
            const next = new Set(prev);
            next.delete(payload.monumentId);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/user/favorites/monuments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setFavoriteMonumentIds((prev) => new Set(prev).add(payload.monumentId));
        }
      }
      return true;
    },
    [favoriteMonumentIds, user],
  );

  const toggleFavoriteDistrict = useCallback(
    async (payload: {
      districtId: string;
      districtName: string;
      region: string;
      imageUrl: string;
    }): Promise<boolean> => {
      if (!user) return false;
      const isFav = favoriteDistrictIds.has(payload.districtId);
      if (isFav) {
        const res = await fetch(`/api/user/favorites/districts/${encodeURIComponent(payload.districtId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFavoriteDistrictIds((prev) => {
            const next = new Set(prev);
            next.delete(payload.districtId);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/user/favorites/districts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setFavoriteDistrictIds((prev) => new Set(prev).add(payload.districtId));
        }
      }
      return true;
    },
    [favoriteDistrictIds, user],
  );

  const recordRecentView = useCallback(
    async (payload: {
      itemType: 'monument' | 'district' | 'culture' | 'article';
      itemId: string;
      itemTitle: string;
      districtId?: string;
      imageUrl?: string;
      routePath: string;
    }) => {
      if (!user) return;
      await fetch('/api/user/recent-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      needsInitialAdmin,
      favoriteMonumentIds,
      favoriteDistrictIds,
      refreshAuth,
      setAuthenticatedUser,
      logout,
      changeLanguageAndSync,
      toggleFavoriteMonument,
      toggleFavoriteDistrict,
      recordRecentView,
    }),
    [
      user,
      loading,
      needsInitialAdmin,
      favoriteMonumentIds,
      favoriteDistrictIds,
      refreshAuth,
      setAuthenticatedUser,
      logout,
      changeLanguageAndSync,
      toggleFavoriteMonument,
      toggleFavoriteDistrict,
      recordRecentView,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
