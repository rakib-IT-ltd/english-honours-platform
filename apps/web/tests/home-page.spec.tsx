import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import HomePage from '../src/app/(public)/page';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

// Clearly labelled TEST data only: these are not real universities or syllabuses.
const universities = [
  { id: 'u1', code: 'test-a', nameEn: 'Test University A', nameBn: null },
  { id: 'u2', code: 'test-b', nameEn: 'Test University B', nameBn: 'পরীক্ষামূলক বি' },
];
const programs = [
  { id: 'p1', universityId: 'u1', code: 'hons', nameEn: 'Test Honours', nameBn: null },
];
const levels = [
  { id: 'l1', code: 'HONOURS_1', sequence: 1, nameEn: 'Honours 1st Year', nameBn: 'অনার্স ১ম বর্ষ' },
];

function stubApi(syllabuses: unknown[]) {
  const fetchMock = vi.fn((input: string) => {
    const url = new URL(input);
    const body = url.pathname.endsWith('/universities')
      ? universities
      : url.pathname.endsWith('/academic-programs')
        ? programs
        : url.pathname.endsWith('/academic-levels')
          ? levels
          : url.pathname.endsWith('/syllabuses')
            ? syllabuses
            : [];
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('HomePage without an API (static preview)', () => {
  it('renders the title, the Bangla line and an honest not-connected notice', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'English Honours Learning Platform' }),
    ).toBeTruthy();
    expect(document.querySelector('p[lang="bn"]')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toContain('not connected');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('switches the interface to Bangla and back', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
    expect(document.documentElement.lang).toBe('bn');
    expect(screen.getByText('আপনার বিশ্ববিদ্যালয় ও স্তর নির্বাচন করুন')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('HomePage selector with an API', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
  });

  it('walks university -> program -> level and shows an empty state when no syllabus exists', async () => {
    const fetchMock = stubApi([]);
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Test University A' })).toBeTruthy(),
    );
    expect((screen.getByLabelText('Program') as HTMLSelectElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('University'), { target: { value: 'u1' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Test Honours' })).toBeTruthy());
    fireEvent.change(screen.getByLabelText('Program'), { target: { value: 'p1' } });
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Honours 1st Year' })).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'l1' } });

    await waitFor(() =>
      expect(
        screen.getByText('No syllabus has been published for this selection yet.'),
      ).toBeTruthy(),
    );
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls).toContain(
      'http://api.test/api/v1/syllabuses?universityId=u1&academicProgramId=p1&academicLevelId=l1&isCurrent=true',
    );
  });

  it('shows a syllabus version with its verification status, never assuming it is verified', async () => {
    stubApi([
      { id: 's1', versionLabel: 'TEST-v1', verificationStatus: 'UNVERIFIED', isCurrent: true },
    ]);
    render(<HomePage />);
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Test University A' })).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText('University'), { target: { value: 'u1' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Test Honours' })).toBeTruthy());
    fireEvent.change(screen.getByLabelText('Program'), { target: { value: 'p1' } });
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Honours 1st Year' })).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'l1' } });
    await waitFor(() => expect(screen.getByText('Not yet verified')).toBeTruthy());
    expect(screen.queryByText('Verified against an official source')).toBeNull();
  });

  it('uses Bangla names when available and falls back to English otherwise', async () => {
    stubApi([]);
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
    await waitFor(() => expect(screen.getByRole('option', { name: 'পরীক্ষামূলক বি' })).toBeTruthy());
    expect(screen.getByRole('option', { name: 'Test University A' })).toBeTruthy();
  });

  it('tells the user when the API cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network'))),
    );
    render(<HomePage />);
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Could not load data'),
    );
  });
});
