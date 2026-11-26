import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { StudyKind } from './study-kinds.js';

const PUBLISHED = 'PUBLISHED' as const;

/** A section is public only when it, its book and the book's course are all PUBLISHED. */
const PUBLIC_SECTION = {
  publicationStatus: PUBLISHED,
  book: { publicationStatus: PUBLISHED, course: { publicationStatus: PUBLISHED } },
} as const;

const ITEM_ORDER = [{ sequence: 'asc' }] as const;

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertBook(bookId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id: bookId, publicationStatus: PUBLISHED, course: { publicationStatus: PUBLISHED } },
      select: { id: true },
    });
    if (!book) throw new NotFoundException(`Book ${bookId} not found`);
  }

  /** The published sections of a book, with the kinds of material each one has. */
  async listSections(bookId: string) {
    await this.assertBook(bookId);
    const sections = await this.prisma.bookSection.findMany({
      where: { bookId, ...PUBLIC_SECTION },
      orderBy: { sequence: 'asc' },
      include: { items: { select: { kind: true } } },
    });
    return sections.map(({ items, ...section }) => ({
      ...section,
      availableKinds: [...new Set(items.map((item) => item.kind))],
    }));
  }

  /** One section with all its items and its neighbours for guided reading. */
  async getSection(id: string) {
    const section = await this.prisma.bookSection.findFirst({
      where: { id, ...PUBLIC_SECTION },
      include: { items: { orderBy: [{ kind: 'asc' }, ...ITEM_ORDER] } },
    });
    if (!section) throw new NotFoundException(`Section ${id} not found`);
    const [previous, next] = await Promise.all([
      this.prisma.bookSection.findFirst({
        where: { bookId: section.bookId, ...PUBLIC_SECTION, sequence: { lt: section.sequence } },
        orderBy: { sequence: 'desc' },
        select: { id: true },
      }),
      this.prisma.bookSection.findFirst({
        where: { bookId: section.bookId, ...PUBLIC_SECTION, sequence: { gt: section.sequence } },
        orderBy: { sequence: 'asc' },
        select: { id: true },
      }),
    ]);
    return { ...section, previousSectionId: previous?.id ?? null, nextSectionId: next?.id ?? null };
  }

  /** One kind of material across all published sections of a book (sections with none are left out). */
  async listResource(bookId: string, kind: StudyKind) {
    await this.assertBook(bookId);
    const sections = await this.prisma.bookSection.findMany({
      where: { bookId, ...PUBLIC_SECTION, items: { some: { kind } } },
      orderBy: { sequence: 'asc' },
      select: {
        id: true,
        sequence: true,
        titleEn: true,
        titleBn: true,
        isSample: true,
        items: { where: { kind }, orderBy: [...ITEM_ORDER] },
      },
    });
    return sections;
  }

  // ----- the signed-in student's own data -----

  private async publicSection(sectionId: string) {
    const section = await this.prisma.bookSection.findFirst({
      where: { id: sectionId, ...PUBLIC_SECTION },
      select: { id: true },
    });
    if (!section) throw new NotFoundException(`Section ${sectionId} not found`);
  }

  async myStudy(userId: string, bookId: string) {
    await this.assertBook(bookId);
    const inBook = { section: { bookId, ...PUBLIC_SECTION } };
    const [progress, bookmarks, notes] = await Promise.all([
      this.prisma.sectionProgress.findMany({
        where: { userId, ...inBook },
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.bookmark.findMany({ where: { userId, ...inBook }, select: { sectionId: true } }),
      this.prisma.studyNote.findMany({
        where: { userId, ...inBook },
        orderBy: { section: { sequence: 'asc' } },
        select: { sectionId: true, body: true, updatedAt: true },
      }),
    ]);
    return {
      completedSectionIds: progress.filter((p) => p.completedAt).map((p) => p.sectionId),
      lastSectionId: progress[0]?.sectionId ?? null,
      bookmarkedSectionIds: bookmarks.map((b) => b.sectionId),
      notes: notes.map((n) => ({ ...n, updatedAt: n.updatedAt.toISOString() })),
    };
  }

  /** Records that the section was opened, and optionally completed or reopened. */
  async setProgress(userId: string, sectionId: string, completed: boolean) {
    await this.publicSection(sectionId);
    await this.prisma.sectionProgress.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: { userId, sectionId, completedAt: completed ? new Date() : null },
      update: { openedAt: new Date(), completedAt: completed ? new Date() : null },
    });
  }

  async addBookmark(userId: string, sectionId: string) {
    await this.publicSection(sectionId);
    await this.prisma.bookmark.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: { userId, sectionId },
      update: {},
    });
  }

  async removeBookmark(userId: string, sectionId: string) {
    await this.prisma.bookmark.deleteMany({ where: { userId, sectionId } });
  }

  async saveNote(userId: string, sectionId: string, body: string) {
    await this.publicSection(sectionId);
    const note = await this.prisma.studyNote.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: { userId, sectionId, body },
      update: { body },
      select: { sectionId: true, body: true, updatedAt: true },
    });
    return { ...note, updatedAt: note.updatedAt.toISOString() };
  }

  async removeNote(userId: string, sectionId: string) {
    await this.prisma.studyNote.deleteMany({ where: { userId, sectionId } });
  }
}
