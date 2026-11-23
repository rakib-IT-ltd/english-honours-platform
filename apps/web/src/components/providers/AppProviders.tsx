'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { getApiBaseUrl } from '../../lib/api';
import {
  getIdToken,
  isAuthConfigured,
  signOutUser,
  subscribeToAuth,
  type SignedInUser,
} from '../../lib/auth/authClient';
import { getMe, updateMe, type Me } from '../../lib/meApi';

// ---------- Language ----------
interface LanguageContextValue {
  language: SupportedLanguage;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside AppProviders');
  return value;
}

// ---------- Authentication ----------
export type AuthStatus = 'disabled' | 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  user: SignedInUser | null;
  /** The platform account (academic identity), when the API is connected. */
  me: Me | null;
  signOut: () => Promise<void>;
  /** Re-reads the platform account, e.g. after saving the profile. */
  setMe: (me: Me) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AppProviders');
  return value;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const configured = isAuthConfigured();

  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [status, setStatus] = useState<AuthStatus>(configured ? 'loading' : 'disabled');
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!configured) return;
    return subscribeToAuth((next) => {
      setUser(next);
      setStatus(next ? 'signedIn' : 'signedOut');
      if (!next) setMe(null);
    });
  }, [configured]);

  // Load the platform account once someone is signed in (needs the API).
  const signedInEmail = user?.email ?? null;
  useEffect(() => {
    if (status !== 'signedIn' || !getApiBaseUrl()) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const account = await getMe(token);
        if (cancelled) return;
        setMe(account);
        setLanguage(account.preferredLanguage);
      } catch {
        if (!cancelled) setMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, signedInEmail]);

  const toggleLanguage = useCallback(() => {
    const next: SupportedLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(next);
    // Remember the choice on the account (best effort).
    if (status === 'signedIn' && getApiBaseUrl()) {
      void (async () => {
        try {
          const token = await getIdToken();
          if (token) setMe(await updateMe(token, { preferredLanguage: next }));
        } catch {
          // the interface language already changed locally; saving can fail silently
        }
      })();
    }
  }, [language, status]);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const languageValue = useMemo(() => ({ language, toggleLanguage }), [language, toggleLanguage]);
  const authValue = useMemo(
    () => ({ status, user, me, signOut, setMe }),
    [status, user, me, signOut],
  );

  return (
    <LanguageContext.Provider value={languageValue}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </LanguageContext.Provider>
  );
}
