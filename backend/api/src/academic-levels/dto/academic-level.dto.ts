import { ApiProperty } from '@nestjs/swagger';

export class AcademicLevelDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String, example: 'HONOURS_1' }) code!: string;
  @ApiProperty({ type: Number, minimum: 1, description: 'Display order across all levels.' })
  sequence!: number;
  @ApiProperty({ type: String }) nameEn!: string;
  @ApiProperty({ type: String, nullable: true }) nameBn!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
