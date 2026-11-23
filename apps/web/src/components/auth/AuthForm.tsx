'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  authErrorKind,
  isAuthConfigured,
  signInWithEmail,
  signUpWithEmail,
  type AuthErrorKind,
} from '../../lib/auth/authClient';
import { STRINGS, type Strings } from '../../lib/i18n';
import { useLanguage } from '../providers/AppProviders';
import { PageShell } from '../layout/PageShell';

const ERROR_TEXT: Record<AuthErrorKind, keyof Strings> = {
  invalidCredentials: 'errInvalidCredentials',
  emailInUse: 'errEmailInUse',
  weakPassword: 'errWeakPassword',
  network: 'errNetwork',
  unknown: 'errUnknown',
};

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { language } = useLanguage();
  const router = useRouter();
  const t = STRINGS[language];
  const register = mode === 'register';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKind | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (register) await signUpWithEmail(email.trim(), password, name.trim());
      else await signInWithEmail(email.trim(), password);
      // New accounts go straight to choosing their university and level.
      router.push(register ? '/profile' : '/');
    } catch (caught) {
      setError(authErrorKind(caught));
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <main className="form-page">
        <h1>{register ? t.signUpTitle : t.signInTitle}</h1>

        {!isAuthConfigured() ? (
          <p role="status" className="notice">
            {t.authNotConfigured}
          </p>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="auth-form">
            {register ? (
              <div className="field">
                <label htmlFor="name">{t.displayName}</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="email">{t.email}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t.password}</label>
              <input
                id="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {register ? <small className="muted">{t.passwordHint}</small> : null}
            </div>

            {error ? (
              <p role="alert" className="form-error">
                {t[ERROR_TEXT[error]] as string}
              </p>
            ) : null}

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? t.working : register ? t.signUpTitle : t.signInTitle}
            </button>
          </form>
        )}

        <p className="form-switch">
          <Link href={register ? '/login' : '/register'}>
            {register ? t.signInLink : t.signUpLink}
          </Link>
        </p>
      </main>
    </PageShell>
  );
}
