import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { BoardTemplate } from './entities/board-template.entity';
import { Board } from '../project/entities/board.entity';
import { Task } from '../project/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardTemplate, Board, Task])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
