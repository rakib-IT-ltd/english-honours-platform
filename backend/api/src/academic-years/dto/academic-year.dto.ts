import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) departmentId!: string;
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 4,
    description: '1 = First Year ... 4 = Fourth Year',
  })
  yearNumber!: number;
  @ApiProperty({ type: String }) nameEn!: string;
  @ApiProperty({ type: String, nullable: true }) nameBn!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
