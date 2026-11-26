import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AppProviders } from '../src/components/providers/AppProviders';
import { ReaderView } from '../src/components/study/ReaderView';
import { ResourceView } from '../src/components/study/ResourceView';
import { StudyCentre, pickCurrentSection } from '../src/components/study/StudyCentre';
import { RESOURCES, type SectionSummary } from '../src/types/study';

const search = vi.hoisted(() => ({ value: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search.value),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

// Clearly labelled TEST data only: not real academic material.
const section = (id: string, sequence: number, kinds: string[], isSample = false) => ({
  id,
  bookId: 'b1',
  sequence,
  titleEn: `Test Section ${sequence}`,
  titleBn: null,
  subtitleEn: `Test subtitle ${sequence}`,
  subtitleBn: null,
  isSample,
  availableKinds: kinds,
});

const item = (kind: string, sequence: number, extra: Record<string, string | null>) => ({
  id: `${kind}-${sequence}`,
  kind,
  sequence,
  textEn: null,
  textBn: null,
  noteEn: null,
  noteBn: null,
  ...extra,
});

const routes: Record<string, unknown> = {
  '/books/b1': {
    id: 'b1',
    courseId: 'c1',
    titleEn: 'Test Book',
    titleBn: null,
    author: 'Test Author',
    publisher: null,
    edition: null,
    publicationYear: 2000,
    description: null,
    genre: 'Test Genre',
    sequence: 1,
    course: { id: 'c1', syllabusId: 's1', code: 'T-101', titleEn: 'Test Course', titleBn: null },
  },
  '/books/b1/sections': [
    section('s1', 1, ['ORIGINAL_TEXT', 'VOCABULARY'], true),
    section('s2', 2, ['ORIGINAL_TEXT']),
  ],
  '/sections/s1': {
    ...section('s1', 1, []),
    isSample: true,
    items: [
      item('ORIGINAL_TEXT', 1, { textEn: 'Test original paragraph.' }),
      item('BANGLA_EXPLANATION', 1, { textBn: 'পরীক্ষামূলক ব্যাখ্যা' }),
      item('VOCABULARY', 1, { textEn: 'testword', textBn: 'পরীক্ষা', noteEn: 'a word for tests' }),
      item('CENTRAL_IDEA', 1, { textEn: 'Test central idea.' }),
    ],
    previousSectionId: null,
    nextSectionId: 's2',
  },
  '/books/b1/resources/VOCABULARY': [
    {
      id: 's1',
      sequence: 1,
      titleEn: 'Test Section 1',
      titleBn: null,
      isSample: true,
      items: [
        item('VOCABULARY', 1, { textEn: 'testword', textBn: 'পরীক্ষা', noteEn: 'a word for tests' }),
      ],
    },
  ],
};

function stubApi(overrides: Record<string, unknown> = {}) {
  const fetchMock = vi.fn((input: string) => {
    const path = new URL(input).pathname.replace('/api/v1', '');
    const all = { ...routes, ...overrides };
    return Promise.resolve(
      path in all
        ? { ok: true, json: () => Promise.resolve(all[path]) }
        : { ok: false, status: 404, json: () => Promise.resolve({}) },
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const wrap = (node: React.ReactNode) => render(<AppProviders>{node}</AppProviders>);

describe('Study centre', () => {
  it('shows the book header, resources in their colours and the sections', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1';
    stubApi();
    wrap(<StudyCentre />);
    expect((await screen.findAllByRole('heading', { name: 'Test Book' })).length).toBe(2);
    expect(screen.getByText('Test Genre')).toBeTruthy();
    expect(screen.getByText('Test Author · 2000')).toBeTruthy();

    const original = screen.getByRole('link', { name: /Original Text/ });
    expect(original.getAttribute('href')).toBe('/study/resource?book=b1&kind=original');
    expect(original.getAttribute('style')).toContain('rgb(231, 240, 255)');
    // a resource nothing was published for is shown as not available, not as a link
    expect(screen.queryByRole('link', { name: /Critical Analysis/ })).toBeNull();
    expect(screen.getAllByText('Not available yet').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /My Study Notes/ })).toBeTruthy();

    expect(screen.getByText(/Sample content for testing the screens/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Test Section 2/ }).getAttribute('href')).toBe(
      '/study/read?book=b1&section=s2',
    );
    // signed out: progress is not saved and sign-in is offered
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Start reading/ }).getAttribute('href')).toBe(
      '/study/read?book=b1&section=s1',
    );
  });

  it('says so when a book has no published study material', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1';
    stubApi({ '/books/b1/sections': [] });
    wrap(<StudyCentre />);
    expect(
      await screen.findByText('Study material for this book is not available yet.'),
    ).toBeTruthy();
  });

  it('does not call the API when it is not configured', () => {
    search.value = 'book=b1';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    wrap(<StudyCentre />);
    expect(screen.getByText('The website is not connected to the server yet.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Where "Continue reading" goes', () => {
  const sections = [1, 2, 3].map((n) => section(`s${n}`, n, [])) as SectionSummary[];
  it('starts at the first, resumes the unfinished last one, then the next unfinished', () => {
    expect(pickCurrentSection(sections, [], null)?.id).toBe('s1');
    expect(pickCurrentSection(sections, [], 's2')?.id).toBe('s2');
    expect(pickCurrentSection(sections, ['s2'], 's2')?.id).toBe('s3');
    expect(pickCurrentSection(sections, ['s1', 's2', 's3'], 's3')?.id).toBe('s1');
    expect(pickCurrentSection([], [], null)).toBeNull();
  });
});

describe('Resource page', () => {
  it('shows one resource across sections and links to guided reading', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1&kind=vocabulary';
    stubApi();
    wrap(<ResourceView />);
    expect(await screen.findByText('testword')).toBeTruthy();
    expect(screen.getByText('পরীক্ষা')).toBeTruthy();
    expect(screen.getByText('a word for tests')).toBeTruthy();
    expect(screen.getByText('Sample content')).toBeTruthy();
    const open = screen.getByRole('link', { name: /Open section: Test Section 1/ });
    expect(open.getAttribute('href')).toBe('/study/read?book=b1&section=s1&view=vocabulary');
  });

  it('offers the sign-in prompt for notes when signed out', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1&kind=notes';
    stubApi();
    wrap(<ResourceView />);
    expect(await screen.findByText(/Sign in to save your progress/)).toBeTruthy();
  });
});

describe('Guided reading', () => {
  it('shows only the resources this section has, keeps English and Bangla apart', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1&section=s1&view=original';
    stubApi();
    wrap(<ReaderView />);
    expect(await screen.findByText('Test original paragraph.')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Original Text' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Bangla Explanation' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Vocabulary' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Central ideas' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'My Study Notes' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: 'Summary' })).toBeNull();
    expect(screen.queryByText('পরীক্ষামূলক ব্যাখ্যা')).toBeNull();
    expect(screen.getByText(/Sample content for testing the screens/)).toBeTruthy();
    // first section: no previous, next goes on
    expect((screen.getByRole('button', { name: /Previous/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: /Next/ }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    // signed out: saving is off
    expect((screen.getByRole('button', { name: /Bookmark/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('shows the Bangla explanation tab content', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'book=b1&section=s1&view=bangla';
    stubApi();
    wrap(<ReaderView />);
    await waitFor(() => expect(screen.getByText('পরীক্ষামূলক ব্যাখ্যা')).toBeTruthy());
    expect(screen.queryByText('Test original paragraph.')).toBeNull();
  });
});

describe('Resource colours', () => {
  it('use the approved soft pastel palette', () => {
    const colours = Object.fromEntries(RESOURCES.map((r) => [r.kind, r.background]));
    expect(colours).toEqual({
      ORIGINAL_TEXT: '#E7F0FF',
      SUMMARY: '#E5F5EA',
      BANGLA_EXPLANATION: '#F0EAFE',
      CRITICAL_ANALYSIS: '#FFF0E3',
      QUOTATION: '#FCEAF0',
      QUESTION_ANSWER: '#E4F5F4',
      VOCABULARY: '#FFF7DF',
      NOTES: '#ECEFF3',
    });
  });
});
