import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SyllabusDetailDto, SyllabusDto } from './dto/syllabus.dto.js';
import { SyllabusesService } from './syllabuses.service.js';

@ApiTags('syllabuses')
@Controller('syllabuses')
export class SyllabusesController {
  constructor(private readonly syllabuses: SyllabusesService) {}

  @Get()
  @ApiOperation({ summary: 'List syllabuses (each is one year of one session in one version)' })
  @ApiQuery({ name: 'academicSessionId', required: false })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiOkResponse({ type: SyllabusDto, isArray: true })
  findAll(
    @Query('academicSessionId') academicSessionId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.syllabuses.findAll({ academicSessionId, academicYearId, departmentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a syllabus with its source documents and verification history' })
  @ApiOkResponse({ type: SyllabusDetailDto })
  @ApiNotFoundResponse({ description: 'Syllabus not found' })
  findOne(@Param('id') id: string) {
    return this.syllabuses.findOne(id);
  }
}
