import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service.js';
import { CourseDetailDto, CourseDto } from './dto/course.dto.js';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List published courses, optionally of one syllabus version' })
  @ApiQuery({ name: 'syllabusId', required: false })
  @ApiOkResponse({ type: CourseDto, isArray: true })
  findAll(@Query('syllabusId') syllabusId?: string) {
    return this.courses.findAll({ syllabusId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one published course with its published books' })
  @ApiOkResponse({ type: CourseDetailDto })
  @ApiNotFoundResponse({ description: 'Course not found or not published' })
  findOne(@Param('id') id: string) {
    return this.courses.findOne(id);
  }
}
