import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicLevelDto } from './dto/academic-level.dto.js';
import { AcademicLevelsService } from './academic-levels.service.js';

@ApiTags('academic-levels')
@Controller('academic-levels')
export class AcademicLevelsController {
  constructor(private readonly academicLevels: AcademicLevelsService) {}

  @Get()
  @ApiOperation({
    summary: 'List the shared academic levels (same for every university), in display order',
  })
  @ApiQuery({ name: 'academicProgramId', required: false })
  @ApiOkResponse({ type: AcademicLevelDto, isArray: true })
  findAll(@Query('academicProgramId') academicProgramId?: string) {
    return this.academicLevels.findAll({ academicProgramId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one academic level' })
  @ApiOkResponse({ type: AcademicLevelDto })
  @ApiNotFoundResponse({ description: 'Academic level not found' })
  findOne(@Param('id') id: string) {
    return this.academicLevels.findOne(id);
  }
}
