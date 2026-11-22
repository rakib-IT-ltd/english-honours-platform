import { ApiProperty } from '@nestjs/swagger';

export class UniversityDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String, description: 'Short stable identifier (unique).' }) code!: string;
  @ApiProperty({ type: String }) nameEn!: string;
  @ApiProperty({ type: String, nullable: true }) nameBn!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
