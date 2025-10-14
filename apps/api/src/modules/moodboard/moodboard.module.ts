import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodboardController } from './moodboard.controller';
import { MoodboardService } from './moodboard.service';
import { Moodboard } from './entities/moodboard.entity';
import { MoodItem } from './entities/mood-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Moodboard, MoodItem])],
  controllers: [MoodboardController],
  providers: [MoodboardService],
  exports: [MoodboardService],
})
export class MoodboardModule {}
