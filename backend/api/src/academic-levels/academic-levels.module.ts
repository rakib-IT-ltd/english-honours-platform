import { Module } from '@nestjs/common';
import { AcademicLevelsController } from './academic-levels.controller.js';
import { AcademicLevelsService } from './academic-levels.service.js';

@Module({
  controllers: [AcademicLevelsController],
  providers: [AcademicLevelsService],
  exports: [AcademicLevelsService],
})
export class AcademicLevelsModule {}
