import { ApiProperty } from '@nestjs/swagger';

export class BookDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) courseId!: string;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
  @ApiProperty({ type: String, nullable: true }) author!: string | null;
  @ApiProperty({ type: String, nullable: true }) publisher!: string | null;
  @ApiProperty({ type: String, nullable: true }) edition!: string | null;
  @ApiProperty({ type: Number, nullable: true }) publicationYear!: number | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: Number }) sequence!: number;
}

export class BookCourseDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) syllabusId!: string;
  @ApiProperty({ type: String }) code!: string;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
}

export class BookDetailDto extends BookDto {
  @ApiProperty({ type: BookCourseDto }) course!: BookCourseDto;
}
