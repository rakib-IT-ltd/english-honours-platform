import { BadRequestException } from '@nestjs/common';

function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

export const MAX_NOTE_LENGTH = 5000;

export function parseNoteBody(body: unknown): string {
  const value = asObject(body)['body'];
  if (typeof value !== 'string') throw new BadRequestException('body must be text');
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_NOTE_LENGTH) {
    throw new BadRequestException(`body must be 1-${MAX_NOTE_LENGTH} characters`);
  }
  return trimmed;
}

export function parseProgressBody(body: unknown): { completed: boolean } {
  const value = asObject(body)['completed'];
  if (typeof value !== 'boolean') throw new BadRequestException('completed must be true or false');
  return { completed: value };
}
