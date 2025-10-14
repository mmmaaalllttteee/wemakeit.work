import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Widget } from './entities/widget.entity';
import { Note } from './entities/note.entity';
import { Project } from '../project/entities/project.entity';
import { Task } from '../project/entities/task.entity';
import { File } from '../files/entities/file.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Widget, Note, Project, Task, File, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
