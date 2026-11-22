import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentDto } from './dto/department.dto.js';
import { DepartmentsService } from './departments.service.js';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  @ApiQuery({ name: 'universityId', required: false })
  @ApiOkResponse({ type: DepartmentDto, isArray: true })
  findAll(@Query('universityId') universityId?: string) {
    return this.departments.findAll({ universityId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one department' })
  @ApiOkResponse({ type: DepartmentDto })
  @ApiNotFoundResponse({ description: 'Department not found' })
  findOne(@Param('id') id: string) {
    return this.departments.findOne(id);
  }
}
