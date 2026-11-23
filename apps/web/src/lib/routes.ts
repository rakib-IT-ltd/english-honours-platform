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
