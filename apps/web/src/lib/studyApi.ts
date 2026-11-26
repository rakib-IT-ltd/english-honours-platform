import { buildApiUrl, getApiBaseUrl } from './api';
import type { MyStudy, StudyNote } from '../types/study';

async function call(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API is not configured');
  const response = await fetch(buildApiUrl(base, path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response;
}

const section = (id: string) => `me/study/sections/${encodeURIComponent(id)}`;

export async function getMyStudy(token: string, bookId: string): Promise<MyStudy> {
  const response = await call(token, 'GET', `me/study/books/${encodeURIComponent(bookId)}`);
  return (await response.json()) as MyStudy;
}

export async function setProgress(token: string, sectionId: string, completed: boolean) {
  await call(token, 'PUT', `${section(sectionId)}/progress`, { completed });
}

export async function setBookmark(token: string, sectionId: string, on: boolean) {
  await call(token, on ? 'PUT' : 'DELETE', `${section(sectionId)}/bookmark`);
}

export async function saveNote(token: string, sectionId: string, body: string): Promise<StudyNote> {
  const response = await call(token, 'PUT', `${section(sectionId)}/note`, { body });
  return (await response.json()) as StudyNote;
}

export async function deleteNote(token: string, sectionId: string) {
  await call(token, 'DELETE', `${section(sectionId)}/note`);
}
