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
  @ApiOperation({
    summary: 'List syllabus versions (one program + level + session of one university)',
  })
  @ApiQuery({ name: 'universityId', required: false })
  @ApiQuery({ name: 'academicProgramId', required: false })
  @ApiQuery({ name: 'academicLevelId', required: false })
  @ApiQuery({ name: 'academicSessionId', required: false })
  @ApiOkResponse({ type: SyllabusDto, isArray: true })
  findAll(
    @Query('universityId') universityId?: string,
    @Query('academicProgramId') academicProgramId?: string,
    @Query('academicLevelId') academicLevelId?: string,
    @Query('academicSessionId') academicSessionId?: string,
  ) {
    return this.syllabuses.findAll({
      universityId,
      academicProgramId,
      academicLevelId,
      academicSessionId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a syllabus with its source documents and verification history' })
  @ApiOkResponse({ type: SyllabusDetailDto })
  @ApiNotFoundResponse({ description: 'Syllabus not found' })
  findOne(@Param('id') id: string) {
    return this.syllabuses.findOne(id);
  }
}
