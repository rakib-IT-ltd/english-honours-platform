import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BooksService } from './books.service.js';
import { BookDetailDto, BookDto } from './dto/book.dto.js';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'List published books of a syllabus version or a course' })
  @ApiQuery({ name: 'syllabusId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiOkResponse({ type: BookDto, isArray: true })
  findAll(@Query('syllabusId') syllabusId?: string, @Query('courseId') courseId?: string) {
    return this.books.findAll({ syllabusId, courseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one published book with its course' })
  @ApiOkResponse({ type: BookDetailDto })
  @ApiNotFoundResponse({ description: 'Book not found or not published' })
  findOne(@Param('id') id: string) {
    return this.books.findOne(id);
  }
}
