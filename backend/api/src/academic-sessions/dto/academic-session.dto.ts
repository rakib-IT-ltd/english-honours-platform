import { ApiProperty } from '@nestjs/swagger';

export class AcademicSessionDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) universityId!: string;
  @ApiProperty({ type: String, description: 'Unique within the university, e.g. "2024-2025".' })
  label!: string;
  @ApiProperty({ type: Number }) startYear!: number;
  @ApiProperty({ type: Number }) endYear!: number;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
