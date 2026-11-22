import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicYearDto } from './dto/academic-year.dto.js';
import { AcademicYearsService } from './academic-years.service.js';

@ApiTags('academic-years')
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYears: AcademicYearsService) {}

  @Get()
  @ApiOperation({ summary: 'List Honours years (First to Fourth)' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiOkResponse({ type: AcademicYearDto, isArray: true })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.academicYears.findAll({ departmentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one academic year' })
  @ApiOkResponse({ type: AcademicYearDto })
  @ApiNotFoundResponse({ description: 'Academic year not found' })
  findOne(@Param('id') id: string) {
    return this.academicYears.findOne(id);
  }
}
