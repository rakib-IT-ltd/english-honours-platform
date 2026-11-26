import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceSectionDto, SectionDetailDto, SectionSummaryDto } from './dto/study.dto.js';
import { isStudyKind } from './study-kinds.js';
import { StudyService } from './study.service.js';

/** Public study material. Only PUBLISHED content is served. */
@ApiTags('study')
@Controller()
export class StudyController {
  constructor(private readonly study: StudyService) {}

  @Get('books/:bookId/sections')
  @ApiOperation({ summary: 'Published sections of a book, with the kinds of material available' })
  @ApiOkResponse({ type: SectionSummaryDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Book not found or not published' })
  sections(@Param('bookId') bookId: string) {
    return this.study.listSections(bookId);
  }

  @Get('books/:bookId/resources/:kind')
  @ApiOperation({ summary: 'One kind of material across the sections of a book' })
  @ApiOkResponse({ type: ResourceSectionDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Book not found or not published' })
  resource(@Param('bookId') bookId: string, @Param('kind') kind: string) {
    if (!isStudyKind(kind)) throw new BadRequestException('Unknown resource kind');
    return this.study.listResource(bookId, kind);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'One published section with all its material (guided reading)' })
  @ApiOkResponse({ type: SectionDetailDto })
  @ApiNotFoundResponse({ description: 'Section not found or not published' })
  section(@Param('id') id: string) {
    return this.study.getSection(id);
  }
}
