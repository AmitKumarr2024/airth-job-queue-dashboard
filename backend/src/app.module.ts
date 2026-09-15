import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JobsModule } from './jobs/jobs.module.js';


@Module({
  imports: [


    // SQLite Database
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'jobs.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),

    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
