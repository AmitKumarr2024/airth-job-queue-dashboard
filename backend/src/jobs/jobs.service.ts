import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job, JobStatus } from './entities/job.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      title: createJobDto.title,
      type: createJobDto.type,
      status: JobStatus.PENDING,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(
    id: string,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const newStatus = updateJobStatusDto.status;

    const validTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.RUNNING],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    if (!validTransitions[job.status].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${job.status} to ${newStatus}`,
      );
    }

    job.status = newStatus;

    return this.jobsRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }
}
