import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicSessionDto } from './dto/academic-session.dto.js';
import { AcademicSessionsService } from './academic-sessions.service.js';

@ApiTags('academic-sessions')
@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(private readonly academicSessions: AcademicSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List academic sessions (newest first)' })
  @ApiQuery({ name: 'universityId', required: false })
  @ApiOkResponse({ type: AcademicSessionDto, isArray: true })
  findAll(@Query('universityId') universityId?: string) {
    return this.academicSessions.findAll({ universityId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one academic session' })
  @ApiOkResponse({ type: AcademicSessionDto })
  @ApiNotFoundResponse({ description: 'Academic session not found' })
  findOne(@Param('id') id: string) {
    return this.academicSessions.findOne(id);
  }
}
