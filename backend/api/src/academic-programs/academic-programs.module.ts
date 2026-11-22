import { Module } from '@nestjs/common';
import { AcademicProgramsController } from './academic-programs.controller.js';
import { AcademicProgramsService } from './academic-programs.service.js';

@Module({
  controllers: [AcademicProgramsController],
  providers: [AcademicProgramsService],
  exports: [AcademicProgramsService],
})
export class AcademicProgramsModule {}
