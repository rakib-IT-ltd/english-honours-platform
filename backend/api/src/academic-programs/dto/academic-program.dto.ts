import { ApiProperty } from '@nestjs/swagger';
import { PROGRAMME_TYPES } from '@ehp/shared-types';
import { AcademicLevelDto } from '../../academic-levels/dto/academic-level.dto.js';

export class AcademicProgramDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) universityId!: string;
  @ApiProperty({ type: String }) departmentId!: string;
  @ApiProperty({ type: String, description: 'Unique within the university.' }) code!: string;
  @ApiProperty({ enum: PROGRAMME_TYPES }) programmeType!: (typeof PROGRAMME_TYPES)[number];
  @ApiProperty({ type: String }) nameEn!: string;
  @ApiProperty({ type: String, nullable: true }) nameBn!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}

export class AcademicProgramDetailDto extends AcademicProgramDto {
  @ApiProperty({
    type: AcademicLevelDto,
    isArray: true,
    description: 'The shared levels this program offers, in display order.',
  })
  levels!: AcademicLevelDto[];
}
