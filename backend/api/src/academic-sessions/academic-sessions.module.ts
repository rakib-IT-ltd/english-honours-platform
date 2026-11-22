import { Module } from '@nestjs/common';
import { AcademicSessionsController } from './academic-sessions.controller.js';
import { AcademicSessionsService } from './academic-sessions.service.js';

@Module({
  controllers: [AcademicSessionsController],
  providers: [AcademicSessionsService],
  exports: [AcademicSessionsService],
})
export class AcademicSessionsModule {}
