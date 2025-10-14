import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectInfoService } from './project-info.service';
import { ProjectInfoController } from './project-info.controller';
import { Project } from './entities/project.entity';
import { Board } from './entities/board.entity';
import { Task } from './entities/task.entity';
import { ProjectInfoPage } from './entities/project-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Board, Task, ProjectInfoPage])],
  controllers: [ProjectController, ProjectInfoController],
  providers: [ProjectService, ProjectInfoService],
  exports: [ProjectService, ProjectInfoService],
})
export class ProjectModule {}
