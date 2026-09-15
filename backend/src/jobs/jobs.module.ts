import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
