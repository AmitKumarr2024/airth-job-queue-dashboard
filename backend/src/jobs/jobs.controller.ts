import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { JobsService } from './jobs.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { Job } from './entities/job.entity.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll(): Promise<Job[]> {
    return this.jobsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}