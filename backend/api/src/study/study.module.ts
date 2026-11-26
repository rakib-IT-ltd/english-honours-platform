import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { UsersModule } from '../users/users.module.js';
import { MyStudyController } from './my-study.controller.js';
import { StudyController } from './study.controller.js';
import { StudyService } from './study.service.js';

@Module({
  imports: [AuthenticationModule, UsersModule],
  controllers: [StudyController, MyStudyController],
  providers: [StudyService],
})
export class StudyModule {}
