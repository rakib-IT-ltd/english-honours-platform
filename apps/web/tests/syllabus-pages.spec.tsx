import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppProviders } from '../src/components/providers/AppProviders';
import { BookView } from '../src/components/syllabus/BookView';
import { SyllabusView } from '../src/components/syllabus/SyllabusView';

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

// Clearly labelled TEST data only: not a real syllabus, course or book.
const routes: Record<string, unknown> = {
  '/universities/u1': { id: 'u1', code: 'test-a', nameEn: 'Test University A', nameBn: null },
  '/academic-programs/p1': {
    id: 'p1',
    universityId: 'u1',
    departmentId: 'd1',
    code: 'hons',
    nameEn: 'Test Honours',
    nameBn: null,
  },
  '/academic-levels/l1': {
    id: 'l1',
    code: 'HONOURS_1',
    sequence: 1,
    nameEn: 'Honours 1st Year',
    nameBn: null,
  },
  '/departments': [
    {
      id: 'd1',
      universityId: 'u1',
      code: 'english',
      nameEn: 'Department of English',
      nameBn: null,
    },
  ],
  '/academic-sessions/ss1': {
    id: 'ss1',
    universityId: 'u1',
    label: 'TEST 2099-2100',
    startYear: 2099,
    endYear: 2100,
  },
  '/syllabuses': [
    {
      id: 's1',
      academicSessionId: 'ss1',
      versionLabel: 'TEST-v1',
      verificationStatus: 'UNVERIFIED',
      isCurrent: true,
    },
  ],
  '/courses': [
    {
      id: 'c1',
      syllabusId: 's1',
      code: 'T-101',
      titleEn: 'Test Course',
      titleBn: null,
      credits: 4,
      marks: null,
      classHours: 120,
      sequence: 1,
    },
  ],
  '/books': [
    {
      id: 'b1',
      courseId: 'c1',
      titleEn: 'Test Book',
      titleBn: null,
      author: 'Test Author',
      publisher: null,
      edition: null,
      publicationYear: null,
      description: null,
      sequence: 1,
    },
  ],
  '/books/b1': {
    id: 'b1',
    courseId: 'c1',
    titleEn: 'Test Book',
    titleBn: null,
    author: 'Test Author',
    publisher: 'Test Press',
    edition: null,
    publicationYear: 2000,
    description: null,
    sequence: 1,
    course: { id: 'c1', syllabusId: 's1', code: 'T-101', titleEn: 'Test Course', titleBn: null },
  },
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

describe('Syllabus page', () => {
  it('shows department, courses and the book list for the selection', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'university=u1&program=p1&level=l1';
    const fetchMock = stubApi();
    wrap(<SyllabusView />);
    await waitFor(() => expect(screen.getByText(/Department of English/)).toBeTruthy());
    expect(screen.getAllByText(/Test University A/).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText('Syllabus Overview')).toBeTruthy());
    expect(await screen.findByText(/Session: TEST 2099-2100/)).toBeTruthy();
    expect(screen.getByText('Not yet verified')).toBeTruthy();
    const link = await screen.findByRole('link', { name: /Study centre/ });
    expect(screen.getByRole('heading', { name: 'Test Book' })).toBeTruthy();
    expect(screen.getByText(/Test Author/)).toBeTruthy();
    expect(link.getAttribute('href')).toContain('/study?book=b1&back=');
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls).toContain('http://api.test/api/v1/books?syllabusId=s1');
    fireEvent.click(screen.getByRole('tab', { name: 'Course Details' }));
    expect(await screen.findByText('Test Course')).toBeTruthy();
    expect(screen.getByText('Credits: 4 · Class hours: 120')).toBeTruthy();
  });

  it('shows honest empty states when nothing is published', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'university=u1&program=p1&level=l1';
    stubApi({ '/courses': [], '/books': [] });
    wrap(<SyllabusView />);
    await waitFor(() =>
      expect(screen.getByText('No books have been published for this syllabus yet.')).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Course Details' }));
    expect(screen.getByText('No courses have been published for this syllabus yet.')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Study Resources' }));
    expect(screen.getByText(/coming soon/)).toBeTruthy();
  });

  it('asks for a selection when the address has none, without calling the API', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    wrap(<SyllabusView />);
    expect(
      screen.getByText('Please choose your university, program and level first.'),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Book page', () => {
  it('shows the book and links back to the syllabus', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'id=b1&back=%2Fsyllabus%3Funiversity%3Du1';
    stubApi();
    wrap(<BookView />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Test Book' })).toBeTruthy());
    expect(screen.getByText('Test Press')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Back to syllabus/ }).getAttribute('href')).toBe(
      '/syllabus?university=u1',
    );
  });

  it('always offers the study centre; says material is coming when none is published', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'id=b1';
    stubApi({ '/books/b1/sections': [] });
    wrap(<BookView />);
    const link = await screen.findByRole('link', { name: /Study centre/ });
    expect(link.getAttribute('href')).toBe('/study?book=b1');
    await waitFor(() => expect(screen.getByText(/coming soon/)).toBeTruthy());
  });

  it('ignores an off-site back address', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'id=b1&back=https%3A%2F%2Fevil.example';
    stubApi();
    wrap(<BookView />);
    expect(screen.getByRole('link', { name: /Back to syllabus/ }).getAttribute('href')).toBe('/');
  });

  it('says so when the book is not published or does not exist', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/api/v1');
    search.value = 'id=nope';
    stubApi();
    wrap(<BookView />);
    await waitFor(() => expect(screen.getByText('This book could not be found.')).toBeTruthy());
  });
});
