import { BadRequestException } from '@nestjs/common';
import { isSupportedLanguage, type SupportedLanguage } from '@ehp/shared-types';

function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

function requiredId(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '' || value.length > 100) {
    throw new BadRequestException(`${field} is required`);
  }
  return value;
}

export interface UpdateMeInput {
  displayName?: string | null;
  preferredLanguage?: SupportedLanguage;
}

export function parseUpdateMe(body: unknown): UpdateMeInput {
  const input = asObject(body);
  const result: UpdateMeInput = {};

  if ('displayName' in input) {
    const value = input['displayName'];
    if (value === null) {
      result.displayName = null;
    } else if (
      typeof value === 'string' &&
      value.trim().length >= 1 &&
      value.trim().length <= 100
    ) {
      result.displayName = value.trim();
    } else {
      throw new BadRequestException('displayName must be 1-100 characters or null');
    }
  }
  if ('preferredLanguage' in input) {
    const value = input['preferredLanguage'];
    if (!isSupportedLanguage(value)) {
      throw new BadRequestException("preferredLanguage must be 'en' or 'bn'");
    }
    result.preferredLanguage = value;
  }
  if (Object.keys(result).length === 0) {
    throw new BadRequestException('Nothing to update');
  }
  return result;
}

export interface SaveProfileInput {
  universityId: string;
  academicProgramId: string;
  academicLevelId: string;
  academicSessionId: string | null;
}

export function parseSaveProfile(body: unknown): SaveProfileInput {
  const input = asObject(body);
  const session = input['academicSessionId'];
  if (
    session !== undefined &&
    session !== null &&
    (typeof session !== 'string' || session.trim() === '')
  ) {
    throw new BadRequestException('academicSessionId must be a non-empty string or null');
  }
  return {
    universityId: requiredId(input, 'universityId'),
    academicProgramId: requiredId(input, 'academicProgramId'),
    academicLevelId: requiredId(input, 'academicLevelId'),
    academicSessionId: typeof session === 'string' ? session : null,
  };
}
