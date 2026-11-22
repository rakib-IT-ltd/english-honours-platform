import { ApiProperty } from '@nestjs/swagger';
import { VERIFICATION_STATUSES } from '@ehp/shared-types';

export class SyllabusSourceDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) syllabusId!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: String }) issuingBody!: string;
  @ApiProperty({ type: String, description: 'Path under academic-content/ or a URL.' })
  documentRef!: string;
  @ApiProperty({ type: String, format: 'date', nullable: true }) publishedOn!: Date | null;
  @ApiProperty({ type: String, nullable: true }) sha256!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}

export class SyllabusVerificationDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) syllabusId!: string;
  @ApiProperty({ type: String }) verifiedBy!: string;
  @ApiProperty({ type: String, nullable: true }) note!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) verifiedAt!: Date;
}

export class SyllabusDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) academicSessionId!: string;
  @ApiProperty({ type: String }) academicYearId!: string;
  @ApiProperty({ type: String }) versionLabel!: string;
  @ApiProperty({
    enum: VERIFICATION_STATUSES,
    description: 'VERIFIED only when checked against a source document.',
  })
  verificationStatus!: (typeof VERIFICATION_STATUSES)[number];
  @ApiProperty({ type: String, nullable: true }) notes!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}

export class SyllabusDetailDto extends SyllabusDto {
  @ApiProperty({ type: SyllabusSourceDto, isArray: true }) sources!: SyllabusSourceDto[];
  @ApiProperty({ type: SyllabusVerificationDto, isArray: true })
  verifications!: SyllabusVerificationDto[];
}
