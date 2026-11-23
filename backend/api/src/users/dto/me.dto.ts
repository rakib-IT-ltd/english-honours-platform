import { ApiProperty } from '@nestjs/swagger';
import { SUPPORTED_LANGUAGES } from '@ehp/shared-types';

export class StudentProfileDto {
  @ApiProperty({ type: String }) universityId!: string;
  @ApiProperty({ type: String }) academicProgramId!: string;
  @ApiProperty({ type: String, description: 'Shared academic level.' }) academicLevelId!: string;
  @ApiProperty({ type: String, nullable: true }) academicSessionId!: string | null;
}

export class MeDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) email!: string;
  @ApiProperty({ type: String, nullable: true }) displayName!: string | null;
  @ApiProperty({ enum: ['STUDENT'] }) role!: 'STUDENT';
  @ApiProperty({ enum: SUPPORTED_LANGUAGES }) preferredLanguage!: string;
  @ApiProperty({ type: StudentProfileDto, nullable: true }) profile!: StudentProfileDto | null;
}

export class UpdateMeBody {
  @ApiProperty({ type: String, nullable: true, required: false, maxLength: 100 })
  displayName?: string | null;
  @ApiProperty({ enum: SUPPORTED_LANGUAGES, required: false }) preferredLanguage?: string;
}

export class SaveProfileBody {
  @ApiProperty({ type: String }) universityId!: string;
  @ApiProperty({ type: String }) academicProgramId!: string;
  @ApiProperty({ type: String }) academicLevelId!: string;
  @ApiProperty({
    type: String,
    nullable: true,
    required: false,
    description: 'Optional until the university sessions are loaded from official documents.',
  })
  academicSessionId?: string | null;
}
