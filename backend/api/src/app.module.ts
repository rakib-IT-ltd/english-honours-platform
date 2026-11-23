import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module.js';
import { AcademicLevelsModule } from './academic-levels/academic-levels.module.js';
import { AcademicProgramsModule } from './academic-programs/academic-programs.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { HealthModule } from './health/health.module.js';
import { SyllabusesModule } from './syllabuses/syllabuses.module.js';
import { UsersModule } from './users/users.module.js';
import { UniversitiesModule } from './universities/universities.module.js';
import { PrismaModule } from './database/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Real environment variables always win; files are a local-development convenience only.
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    HealthModule,
    UniversitiesModule,
    DepartmentsModule,
    AcademicProgramsModule,
    AcademicLevelsModule,
    AcademicSessionsModule,
    SyllabusesModule,
    UsersModule,
  ],
})
export class AppModule {}
