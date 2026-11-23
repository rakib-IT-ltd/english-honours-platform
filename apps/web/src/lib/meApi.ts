import { buildApiUrl, getApiBaseUrl } from './api';

export interface MeProfile {
  universityId: string;
  academicProgramId: string;
  academicLevelId: string;
  academicSessionId: string | null;
}

export interface Me {
  id: string;
  email: string;
  displayName: string | null;
  role: 'STUDENT';
  preferredLanguage: 'en' | 'bn';
  profile: MeProfile | null;
}

async function call(token: string, method: string, path: string, body?: unknown): Promise<Me> {
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
  return (await response.json()) as Me;
}

export const getMe = (token: string) => call(token, 'GET', 'me');

export const updateMe = (
  token: string,
  body: { displayName?: string | null; preferredLanguage?: 'en' | 'bn' },
) => call(token, 'PATCH', 'me', body);

export const saveProfile = (
  token: string,
  body: { universityId: string; academicProgramId: string; academicLevelId: string },
) => call(token, 'PUT', 'me/profile', body);
