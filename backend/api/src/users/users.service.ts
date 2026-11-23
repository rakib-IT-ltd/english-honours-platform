import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { VerifiedIdToken } from '../authentication/id-token-verifier.js';
import type { SaveProfileInput, UpdateMeInput } from './dto/parse.js';

const WITH_PROFILE = { profile: true } as const;

/** Prisma error code for a foreign key violation. */
const FOREIGN_KEY_VIOLATION = 'P2003';
const UNIQUE_VIOLATION = 'P2002';

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the user for a verified Firebase identity, creating the row on first sign-in. */
  async findOrCreate(identity: VerifiedIdToken) {
    if (!identity.email) {
      throw new UnauthorizedException('The account has no email address');
    }
    try {
      return await this.prisma.user.upsert({
        where: { firebaseUid: identity.uid },
        update: {},
        create: { firebaseUid: identity.uid, email: identity.email, displayName: identity.name },
        include: WITH_PROFILE,
      });
    } catch (error) {
      if (errorCode(error) === UNIQUE_VIOLATION) {
        throw new ConflictException('This email address is already linked to another account');
      }
      throw error;
    }
  }

  async updateAccount(userId: string, input: UpdateMeInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data: input,
      include: WITH_PROFILE,
    });
  }

  /**
   * Saves the student's academic identity. The database also enforces these rules through
   * composite foreign keys; the checks here exist to return a clear message.
   */
  async saveProfile(userId: string, input: SaveProfileInput) {
    const program = await this.prisma.academicProgram.findUnique({
      where: { id: input.academicProgramId },
      select: { universityId: true, levels: { select: { levelId: true } } },
    });
    if (!program || program.universityId !== input.universityId) {
      throw new UnprocessableEntityException(
        'The academic program does not exist at the selected university',
      );
    }
    if (!program.levels.some((level) => level.levelId === input.academicLevelId)) {
      throw new UnprocessableEntityException('The selected program does not offer this level');
    }
    if (input.academicSessionId) {
      const session = await this.prisma.academicSession.findUnique({
        where: { id: input.academicSessionId },
        select: { universityId: true },
      });
      if (!session || session.universityId !== input.universityId) {
        throw new UnprocessableEntityException(
          'The academic session does not exist at the selected university',
        );
      }
    }

    const data = {
      universityId: input.universityId,
      academicProgramId: input.academicProgramId,
      academicLevelId: input.academicLevelId,
      academicSessionId: input.academicSessionId,
    };
    try {
      await this.prisma.studentProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    } catch (error) {
      if (errorCode(error) === FOREIGN_KEY_VIOLATION) {
        throw new UnprocessableEntityException('The selected academic identity is not valid');
      }
      throw error;
    }
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: WITH_PROFILE });
  }
}

export type UserWithProfile = Awaited<ReturnType<UsersService['findOrCreate']>>;

/** Public shape of the current user (never exposes the Firebase uid). */
export function toMe(user: UserWithProfile) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    profile: user.profile
      ? {
          universityId: user.profile.universityId,
          academicProgramId: user.profile.academicProgramId,
          academicLevelId: user.profile.academicLevelId,
          academicSessionId: user.profile.academicSessionId,
        }
      : null,
  };
}
