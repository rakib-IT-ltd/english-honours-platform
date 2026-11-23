import { ApiProperty } from '@nestjs/swagger';
import { BookDto } from '../../books/dto/book.dto.js';

export class CourseDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) syllabusId!: string;
  @ApiProperty({ type: String, example: 'as printed in the official syllabus' }) code!: string;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
  @ApiProperty({ type: Number, nullable: true }) credits!: number | null;
  @ApiProperty({ type: Number, nullable: true }) marks!: number | null;
  @ApiProperty({ type: Number }) sequence!: number;
}

export class CourseDetailDto extends CourseDto {
  @ApiProperty({ type: BookDto, isArray: true }) books!: BookDto[];
}
