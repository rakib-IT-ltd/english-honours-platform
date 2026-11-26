export interface SyllabusSelection {
  universityId: string;
  programId: string;
  levelId: string;
}

/** Page 2: the syllabus and book list for a university + program + level. */
export function syllabusHref(selection: SyllabusSelection): string {
  const query = new URLSearchParams({
    university: selection.universityId,
    program: selection.programId,
    level: selection.levelId,
  });
  return `/syllabus?${query.toString()}`;
}

/** Page 3: one book. `back` is the syllabus page it was opened from. */
export function bookHref(bookId: string, back?: string): string {
  const query = new URLSearchParams({ id: bookId });
  if (back) query.set('back', back);
  return `/book?${query.toString()}`;
}

/** Study centre of a book (sections, resources, progress). */
export function studyHref(bookId: string, back?: string): string {
  const query = new URLSearchParams({ book: bookId });
  if (back) query.set('back', back);
  return `/study?${query.toString()}`;
}

/** One study resource (e.g. vocabulary) across the sections of a book. */
export function studyResourceHref(bookId: string, slug: string): string {
  return `/study/resource?${new URLSearchParams({ book: bookId, kind: slug }).toString()}`;
}

/** Guided reading of one section, optionally on a given resource tab. */
export function studyReadHref(bookId: string, sectionId: string, view?: string): string {
  const query = new URLSearchParams({ book: bookId, section: sectionId });
  if (view) query.set('view', view);
  return `/study/read?${query.toString()}`;
}
