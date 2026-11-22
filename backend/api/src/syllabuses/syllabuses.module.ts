import { Module } from '@nestjs/common';
import { SyllabusesController } from './syllabuses.controller.js';
import { SyllabusesService } from './syllabuses.service.js';

@Module({
  controllers: [SyllabusesController],
  providers: [SyllabusesService],
  exports: [SyllabusesService],
})
export class SyllabusesModule {}
