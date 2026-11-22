import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { SyllabusSourceType, VerificationStatus } from '../generated/prisma/enums.js';

export interface SyllabusFilter {
  universityId?: string;
  academicProgramId?: string;
  academicLevelId?: string;
  academicSessionId?: string;
}

export interface VerifySyllabusInput {
  /** Reviewer name/identifier (becomes a user reference when the users module exists). */
  verifiedBy: string;
  note?: string;
}

@Injectable()
export class SyllabusesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: SyllabusFilter = {}) {
    return this.prisma.syllabus.findMany({
      where: {
        universityId: filter.universityId,
        academicProgramId: filter.academicProgramId,
        academicLevelId: filter.academicLevelId,
        academicSessionId: filter.academicSessionId,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const syllabus = await this.prisma.syllabus.findUnique({
      where: { id },
      include: {
        sources: { orderBy: { createdAt: 'asc' } },
        verifications: { orderBy: { verifiedAt: 'asc' } },
      },
    });
    if (!syllabus) throw new NotFoundException(`Syllabus ${id} not found`);
    return syllabus;
  }

  /**
   * Marks a syllabus as VERIFIED. Governance rule (CLAUDE.md): nothing is verified implicitly, so
   * a syllabus needs at least one source document, and the verification record is written in the
   * same transaction as the status change.
   *
   * Not exposed over HTTP yet: it needs the authentication/authorization module.
   */
  async verify(id: string, input: VerifySyllabusInput) {
    const verifiedBy = input.verifiedBy.trim();
    if (!verifiedBy) throw new BadRequestException('verifiedBy is required');

    return this.prisma.$transaction(async (tx) => {
      const syllabus = await tx.syllabus.findUnique({
        where: { id },
        // Only official university documents can support verification.
        include: {
          _count: {
            select: {
              sources: { where: { sourceType: SyllabusSourceType.OFFICIAL_UNIVERSITY_DOCUMENT } },
            },
          },
        },
      });
      if (!syllabus) throw new NotFoundException(`Syllabus ${id} not found`);
      if (syllabus.verificationStatus === VerificationStatus.VERIFIED) {
        throw new ConflictException(`Syllabus ${id} is already verified`);
      }
      if (syllabus._count.sources === 0) {
        throw new UnprocessableEntityException(
          'A syllabus cannot be verified without at least one official university source document',
        );
      }

      await tx.syllabusVerification.create({
        data: { syllabusId: id, verifiedBy, note: input.note?.trim() || null },
      });
      // Guarded update: if a concurrent request verified it first, roll everything back.
      const { count } = await tx.syllabus.updateMany({
        where: { id, verificationStatus: VerificationStatus.UNVERIFIED },
        data: { verificationStatus: VerificationStatus.VERIFIED },
      });
      if (count !== 1) throw new ConflictException(`Syllabus ${id} is already verified`);

      return tx.syllabus.findUniqueOrThrow({ where: { id } });
    });
  }
}
