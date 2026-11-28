export const EXPORT_FORMAT: string;
export const EXPORT_FORMAT_VERSION: number;
export const PERSONAL_TABLES: string[];

export interface ForeignKeyEdge {
  table: string;
  references: string;
}

export interface ExportTable {
  name: string;
  rowCount: number;
  sha256: string;
  rows: Record<string, unknown>[];
}

export interface ExportDocument {
  format: string;
  formatVersion: number;
  exportedAt: string;
  scope: 'full' | 'content';
  containsPersonalData: boolean;
  migrations: string[];
  tables: ExportTable[];
  checksum: string;
}

export function canonicalJson(value: unknown): string;
export function sha256(text: string): string;
export function rowsChecksum(rows: unknown[]): string;
export function sameExceptTimestamps(
  rowsA: Record<string, unknown>[],
  rowsB: Record<string, unknown>[],
): boolean;
export function sortTables(tables: string[], edges: ForeignKeyEdge[]): string[];
export function chooseTables(
  allTables: string[],
  edges: ForeignKeyEdge[],
  scope: 'full' | 'content',
): string[];
export function buildDocument(input: {
  scope: 'full' | 'content';
  migrations: string[];
  tables: { name: string; rows: Record<string, unknown>[] }[];
  exportedAt: string;
}): ExportDocument;
export function verifyDocument(doc: unknown): ExportDocument;
export function databaseName(connectionString: string): string;
export function quoteIdent(name: string): string;
export function confirmationError(targetDatabase: string, confirmed: unknown): string | null;
export function migrationMismatch(
  fileMigrations: string[],
  targetMigrations: string[],
): string | null;
export function parseArgs(
  argv: string[],
  valueFlags: string[],
): { flags: Record<string, string | boolean>; positional: string[] };
