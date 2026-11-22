import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PROGRAMME_TYPES } from '@ehp/shared-types';
import { AcademicProgramDetailDto, AcademicProgramDto } from './dto/academic-program.dto.js';
import { AcademicProgramsService } from './academic-programs.service.js';

@ApiTags('academic-programs')
@Controller('academic-programs')
export class AcademicProgramsController {
  constructor(private readonly academicPrograms: AcademicProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'List academic programs (university-specific)' })
  @ApiQuery({ name: 'universityId', required: false })
  @ApiQuery({ name: 'programmeType', required: false, enum: PROGRAMME_TYPES })
  @ApiOkResponse({ type: AcademicProgramDto, isArray: true })
  findAll(
    @Query('universityId') universityId?: string,
    @Query('programmeType') programmeType?: string,
  ) {
    if (
      programmeType !== undefined &&
      !(PROGRAMME_TYPES as readonly string[]).includes(programmeType)
    ) {
      throw new BadRequestException(`programmeType must be one of: ${PROGRAMME_TYPES.join(', ')}`);
    }
    return this.academicPrograms.findAll({
      universityId,
      programmeType: programmeType as (typeof PROGRAMME_TYPES)[number] | undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program with the shared levels it offers' })
  @ApiOkResponse({ type: AcademicProgramDetailDto })
  @ApiNotFoundResponse({ description: 'Academic program not found' })
  findOne(@Param('id') id: string) {
    return this.academicPrograms.findOne(id);
  }
}
