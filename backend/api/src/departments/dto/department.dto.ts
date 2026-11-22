import { ApiProperty } from '@nestjs/swagger';

export class DepartmentDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) universityId!: string;
  @ApiProperty({ type: String, description: 'Unique within the university.' }) code!: string;
  @ApiProperty({ type: String }) nameEn!: string;
  @ApiProperty({ type: String, nullable: true }) nameBn!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
