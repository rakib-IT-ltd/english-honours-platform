import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthForm } from '../src/components/auth/AuthForm';
import { ProfileView } from '../src/components/auth/ProfileView';
import { AppProviders } from '../src/components/providers/AppProviders';
import HomePage from '../src/app/(public)/page';
import type { SignedInUser } from '../src/lib/auth/authClient';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

/** Controllable stand-in for Firebase: no network, no real accounts. */
const fake = vi.hoisted(() => ({
  configured: true,
  user: null as { email: string | null; displayName: string | null } | null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../src/lib/auth/authClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/auth/authClient')>();
  return {
    ...actual,
    isAuthConfigured: () => fake.configured,
    subscribeToAuth: (callback: (user: SignedInUser | null) => void) => {
      callback(fake.user);
      return () => undefined;
    },
    getIdToken: () => Promise.resolve(fake.user ? 'test-token' : null),
    signInWithEmail: fake.signIn,
    signUpWithEmail: fake.signUp,
    signOutUser: fake.signOut,
  };
});

// Clearly labelled TEST data only.
const universities = [{ id: 'u1', code: 'test-a', nameEn: 'Test University A', nameBn: null }];
const programs = [
  { id: 'p1', universityId: 'u1', code: 'hons', nameEn: 'Test Honours', nameBn: null },
];
const levels = [
  { id: 'l1', code: 'HONOURS_1', sequence: 1, nameEn: 'Honours 1st Year', nameBn: null },
];
const me = (profile: unknown) => ({
  id: 'user-1',
  email: 'student@example.test',
  displayName: 'Test Student',
  role: 'STUDENT',
  preferredLanguage: 'en',
  profile,
});

function stubApi(initialProfile: unknown = null) {
  let profile = initialProfile;
  const calls: Array<{
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string, init?: RequestInit) => {
      const url = new URL(input);
      const method = init?.method ?? 'GET';
      calls.push({
        method,
        url: input,
        headers: (init?.headers ?? {}) as Record<string, string>,
        ...(typeof init?.body === 'string' ? { body: init.body } : {}),
      });
      let body: unknown = [];
      if (url.pathname.endsWith('/universities')) body = universities;
      else if (url.pathname.endsWith('/academic-programs')) body = programs;
      else if (url.pathname.endsWith('/academic-levels')) body = levels;
      else if (url.pathname.endsWith('/me/profile') && method === 'PUT') {
        const sent = JSON.parse(init?.body as string) as Record<string, string>;
        profile = { ...sent, academicSessionId: null };
        body = me(profile);
      } else if (url.pathname.endsWith('/me')) body = me(profile);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }),
  );
  return calls;
}

const wrap = (node: React.ReactNode) => render(<AppProviders>{node}</AppProviders>);

beforeEach(() => {
  fake.configured = true;
  fake.user = null;
  fake.signIn.mockReset().mockResolvedValue(undefined);
  fake.signUp.mockReset().mockResolvedValue(undefined);
  push.mockReset();
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('header', () => {
  it('offers Sign In (a link) when signed out', async () => {
    stubApi();
    wrap(<HomePage />);
    const link = await screen.findByRole('link', { name: 'Sign In' });
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('offers My profile and Sign out when signed in, and calls sign out', async () => {
    fake.user = { email: 'student@example.test', displayName: 'Test Student' };
    stubApi();
    wrap(<HomePage />);
    expect((await screen.findAllByRole('link', { name: 'My profile' })).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(fake.signOut).toHaveBeenCalled();
  });

  it('keeps Sign In disabled when authentication is not configured', () => {
    fake.configured = false;
    wrap(<HomePage />);
    expect((screen.getByRole('button', { name: /Sign In/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});

describe('sign-in and sign-up forms', () => {
  it('signs in with the typed credentials and returns home', async () => {
    wrap(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'student@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Sign in' }).closest('form') as HTMLFormElement,
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    expect(fake.signIn).toHaveBeenCalledWith('student@example.test', 'secret12');
  });

  it('shows a friendly message for wrong credentials and does not navigate', async () => {
    fake.signIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    wrap(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'a@b.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-pass' } });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Sign in' }).closest('form') as HTMLFormElement,
    );
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('The email or password is not correct.'),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('creates an account with the name and sends new students to their profile', async () => {
    wrap(<AuthForm mode="register" />);
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'new@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
    fireEvent.submit(
      screen
        .getByRole('button', { name: 'Create your account' })
        .closest('form') as HTMLFormElement,
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/profile'));
    expect(fake.signUp).toHaveBeenCalledWith('new@example.test', 'secret12', 'Test Student');
  });

  it('explains that sign-in is unavailable when not configured', () => {
    fake.configured = false;
    wrap(<AuthForm mode="login" />);
    expect(screen.getByRole('status').textContent).toContain('not available');
    expect(screen.queryByLabelText('Password')).toBeNull();
  });
});

describe('profile page', () => {
  it('asks signed-out visitors to sign in', async () => {
    wrap(<ProfileView />);
    expect(await screen.findByText(/Please sign in to set up your profile/)).toBeTruthy();
  });

  it('saves the chosen university, program and level with the bearer token', async () => {
    fake.user = { email: 'student@example.test', displayName: 'Test Student' };
    const calls = stubApi();
    wrap(<ProfileView />);

    fireEvent.click(await screen.findByRole('button', { name: /Test University A/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Test Honours/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Honours 1st Year/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save my profile' }));

    await waitFor(() => expect(screen.getByText(/Your profile has been saved/)).toBeTruthy());
    const put = calls.find((call) => call.method === 'PUT');
    expect(put?.url).toBe('http://api.test/api/v1/me/profile');
    expect(put?.headers['Authorization']).toBe('Bearer test-token');
    expect(JSON.parse(put?.body ?? '{}')).toEqual({
      universityId: 'u1',
      academicProgramId: 'p1',
      academicLevelId: 'l1',
    });
  });

  it('keeps Save disabled until all three choices are made', async () => {
    fake.user = { email: 'student@example.test', displayName: null };
    stubApi();
    wrap(<ProfileView />);
    await screen.findByRole('button', { name: /Test University A/ });
    expect(
      (screen.getByRole('button', { name: 'Save my profile' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

describe('home page for a signed-in student', () => {
  it('preselects the saved university, program and level', async () => {
    fake.user = { email: 'student@example.test', displayName: 'Test Student' };
    const calls = stubApi({
      universityId: 'u1',
      academicProgramId: 'p1',
      academicLevelId: 'l1',
      academicSessionId: null,
    });
    wrap(<HomePage />);
    await waitFor(() =>
      expect(calls.map((call) => call.url)).toContain(
        'http://api.test/api/v1/syllabuses?universityId=u1&academicProgramId=p1&academicLevelId=l1&isCurrent=true',
      ),
    );
    expect(screen.getByText('Change my university and level')).toBeTruthy();
  });

  it('invites a student without a profile to complete it', async () => {
    fake.user = { email: 'student@example.test', displayName: 'Test Student' };
    stubApi(null);
    wrap(<HomePage />);
    expect(await screen.findByText(/Complete your profile/)).toBeTruthy();
  });
});
