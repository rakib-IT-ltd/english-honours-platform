import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UniversityDto } from './dto/university.dto.js';
import { UniversitiesService } from './universities.service.js';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universities: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List universities' })
  @ApiOkResponse({ type: UniversityDto, isArray: true })
  findAll() {
    return this.universities.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one university' })
  @ApiOkResponse({ type: UniversityDto })
  @ApiNotFoundResponse({ description: 'University not found' })
  findOne(@Param('id') id: string) {
    return this.universities.findOne(id);
  }
}
